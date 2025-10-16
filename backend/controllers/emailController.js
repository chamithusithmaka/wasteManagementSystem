// import { sendEmail } from '../utils/sendEmail.js';
// import generateReceiptHTML from '../utils/generateReceiptHTML.js'; // You need to create this

// export const emailReceiptController = async (req, res) => {
//   try {
//     const { email, receipt } = req.body;
    
//     if (!email || !receipt) {
//       return res.status(400).json({ message: 'Email address and receipt details are required' });
//     }
    
//     const html = generateReceiptHTML(receipt);
    
//     await sendEmail({
//       to: email,
//       subject: `Receipt: ${receipt.reference}`,
//       text: `Your receipt ${receipt.reference} for ${receipt.total} LKR is attached.`,
//       html
//     });
    
//     res.json({ success: true, message: 'Receipt sent successfully' });
//   } catch (err) {
//     console.error('Error sending receipt:', err);
//     res.status(500).json({ message: 'Failed to send receipt', error: err.message });
//   }
// };