const Imap = require('node-imap');
const { simpleParser } = require('mailparser');
const Proposal = require('../models/Proposal');
const Vendor = require('../models/Vendor');
const ai = require('./aiService');

let imapConfig = {
  user: process.env.IMAP_USER,
  password: process.env.IMAP_PASS,
  host: process.env.IMAP_HOST,
  port: parseInt(process.env.IMAP_PORT),
  tls: true
};

async function bufferFromAttachment(att) {
  if (!att) return null;
  if (Buffer.isBuffer(att.content)) return att.content;
  if (att.content && typeof att.content.pipe === 'function') {
    const chunks = [];
    return new Promise((resolve, reject) => {
      att.content.on('data', c => chunks.push(c));
      att.content.on('end', () => resolve(Buffer.concat(chunks)));
      att.content.on('error', reject);
    });
  }}

async function extractPdfTextFromAttachment(att) {
  try {
  
    const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs');

    // get a Buffer from the attachment 
    const buf = await bufferFromAttachment(att);
    if (!buf) {
      console.warn('Attachment buffer empty for', att.filename);
      return null;
    }

    const uint8 = new Uint8Array(buf);

    const loadingTask = pdfjsLib.getDocument({ data: uint8 });
    const pdf = await loadingTask.promise;

    const maxPages = pdf.numPages || 0;
    let fullText = '';

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const strings = content.items.map(i => (i.str || '')).filter(Boolean);
      fullText += strings.join(' ') + '\n';
    }

    const text = fullText.trim();

    if (text && text.length > 10) return text;
    return null;
  } catch (err) {
    console.warn('pdfjs extract error for', att.filename, err && err.message);
    return null;
  }
}



async function processMessage(mail){
  // mail: parsed message with subject, from, text, html, attachments
  const from = (mail.from && mail.from.value && mail.from.value[0]) || {};
  const senderEmail = from.address;
  // crude heuristic: subject contains "RFP:" and RFP id was included in original email subject e.g. "RFP: {title} [rfpId:abc123]"
  const subject = mail.subject || '';
  const rfpIdMatch = subject.match(/\[rfpId:(.+?)\]/);
  let rfpId = rfpIdMatch ? rfpIdMatch[1] : null;

  // find vendor by email
  const vendor = await Vendor.findOne({ email: senderEmail });
  if(!vendor){
    console.log("Unknown vendor replied:", senderEmail);
    return;
  }


  let bodyText = (mail.text || (mail.html ? mail.html.replace(/<[^>]+>/g, '') : '') || '').trim();

  //attachments handling

  let attachmentsText = '';
  
  if (Array.isArray(mail.attachments) && mail.attachments.length) {
    for (const att of mail.attachments) {
     
      const looksLikePdf = (att.filename && att.filename.toLowerCase().endsWith('.pdf')) ||
                          (att.contentType && att.contentType.toLowerCase().includes('pdf'));

      if (looksLikePdf) {
        const pdfText = await extractPdfTextFromAttachment(att);
          if (pdfText) {
            attachmentsText += '\n\n' + pdfText;
          } else {
            attachmentsText += `\n\n[PDF ATTACHMENT: ${att.filename} — no extractable text; requires manual review]`;
          }

      }
    } 
  }

  // merge body + attachments
  if (attachmentsText) 
    bodyText = (bodyText + '\n\n' + attachmentsText).trim();


  const parsed = await ai.parseVendorResponse(bodyText);

  // create proposal
  const proposal = new Proposal({
    rfpId,
    vendorId: vendor._id,
    price: parsed.price || null,
    delivery: parsed.delivery || parsed.delivery_timeline || null,
    warranty: parsed.warranty || null,
    terms: parsed.payment_terms || parsed.terms || null,
    items: parsed.items || [],
    notes: parsed.notes || null,
    raw_email: {bodyText}
  });
  await proposal.save();
  console.log("Saved proposal from", vendor.email);
}

function start(){
  const imap = new Imap(imapConfig);

  function openInbox(cb){
    imap.openBox('INBOX', false, cb);
  }

  imap.once('ready', function() {
    console.log("IMAP ready");
    openInbox(function(err, box) {
      if (err) throw err;
      imap.on('mail', function(numNewMsgs) {
        // fetch last numNewMsgs messages
        const fetch = imap.seq.fetch(box.messages.total + ':' + (box.messages.total + numNewMsgs - 1), { bodies: '', struct: true });
        fetch.on('message', function(msg) {
          msg.on('body', function(stream) {
            simpleParser(stream).then(processMessage).catch(console.error);
          });
        });
      });
    });
  });

  imap.once('error', function(err) {
    console.error(err);
  });

  imap.once('end', function() {
    console.log('IMAP connection ended');
  });

  imap.connect();
}

module.exports = { start };