import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import client from '../api/client';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { getHSNSACSummary } from '../utils/numberToWords';

export default function InvoiceViewPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await client.get(`/invoices/${id}`);
        setInvoice(res.data);
      } catch (err) {
        toast.error('Failed to load invoice details');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const handleDownload = async () => {
    try {
      const response = await client.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${invoice.invoice_no}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to download invoice');
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoice_no}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; list-style: none; }
          html, body { font-family: Arial, sans-serif; font-size: 10px; color: #000; background: white; }
          table { border-collapse: collapse; width: 100%; }
          td, th { border: 1px solid #000; padding: 2px 3px; }
          th { background: #f0f0f0; font-weight: bold; text-align: center; }
          .header { display: flex; justify-content: space-between; margin-bottom: 4px; border-bottom: 1px solid #000; padding-bottom: 4px; }
          .title { font-size: 14px; font-weight: bold; }
          .company { text-align: right; }
          .row { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 4px; }
          .box { border: 1px solid #000; padding: 3px; font-size: 9px; }
          .section-title { font-weight: bold; font-size: 9px; border-bottom: 1px solid #000; margin-bottom: 2px; }
          @page { margin: 3mm; size: A4; }
          @media print { body { margin: 0; padding: 2px; } }
        </style>
      </head>
      <body>${printContent.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
  };

  if (loading) return <div className="text-center p-12">Loading...</div>;
  if (!invoice) return <div className="text-center p-12">Invoice not found</div>;

  const roundOff = parseFloat(invoice.round_off || 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/invoices" className="p-2 rounded-full transition-colors" style={{backgroundColor: '#1e293b'}}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold">Invoice {invoice.invoice_no}</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
            <Printer className="w-4 h-4" /> Print Invoice
          </button>
          <button onClick={handleDownload} className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      <div className="glass-card rounded-xl text-white shadow-xl overflow-x-auto" style={{backgroundColor: '#0f172a', padding: '4px'}}>
        <div ref={printRef} style={{backgroundColor: '#fff', color: '#000', padding: '4px', fontSize: '10px', fontFamily: 'Arial'}}>
          {/* Header */}
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px', borderBottom: '1px solid #000', paddingBottom: '4px'}}>
            <div>
              <div style={{fontSize: '14px', fontWeight: 'bold'}}>TAX INVOICE</div>
              <div style={{fontSize: '8px', marginTop: '2px'}}>{invoice.invoice_no} | {invoice.invoice_date}</div>
            </div>
            <div style={{textAlign: 'right', fontSize: '11px', fontWeight: 'bold'}}>VUK TRADERS</div>
          </div>

          {/* Invoice Details Table */}
          <table style={{marginBottom: '4px', fontSize: '9px'}}>
            <tr>
              <td style={{width: '25%'}}><strong>SI No.</strong></td>
              <td style={{width: '30%'}}><strong>Description of Goods</strong></td>
              <td style={{width: '15%', textAlign: 'center'}}><strong>HSN/SAC</strong></td>
              <td style={{width: '10%', textAlign: 'center'}}><strong>Qty</strong></td>
              <td style={{width: '10%', textAlign: 'right'}}><strong>Rate</strong></td>
              <td style={{width: '10%', textAlign: 'center'}}><strong>CGST @%</strong></td>
              <td style={{width: '10%', textAlign: 'center'}}><strong>SGST @%</strong></td>
              <td style={{width: '10%', textAlign: 'right'}}><strong>Amount</strong></td>
            </tr>
            {invoice.items.map((item, index) => (
              <tr key={item.id} style={{fontSize: '9px'}}>
                <td style={{textAlign: 'center'}}>{index + 1}</td>
                <td>{item.description}</td>
                <td style={{textAlign: 'center'}}>{item.hsn_sac || '-'}</td>
                <td style={{textAlign: 'center'}}>{item.quantity}</td>
                <td style={{textAlign: 'right'}}>{parseFloat(item.rate).toFixed(2)}</td>
                <td style={{textAlign: 'center'}}>9.00%</td>
                <td style={{textAlign: 'center'}}>9.00%</td>
                <td style={{textAlign: 'right'}}>{parseFloat(item.amount).toFixed(2)}</td>
              </tr>
            ))}
            <tr style={{fontWeight: 'bold'}}>
              <td colSpan="5" style={{textAlign: 'right', borderRight: '1px solid #000'}}>Total</td>
              <td style={{textAlign: 'center'}}>{parseFloat(invoice.total_cgst / (invoice.subtotal || 1) * 100).toFixed(1)}%</td>
              <td style={{textAlign: 'center'}}>{parseFloat(invoice.total_sgst / (invoice.subtotal || 1) * 100).toFixed(1)}%</td>
              <td style={{textAlign: 'right'}}>{parseFloat(invoice.subtotal).toFixed(2)}</td>
            </tr>
          </table>

          {/* Party Info */}
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', marginBottom: '4px', fontSize: '9px'}}>
            <div style={{border: '1px solid #000', padding: '3px'}}>
              <div style={{fontWeight: 'bold', marginBottom: '2px'}}>Buyer Bill to</div>
              <div style={{fontSize: '8px'}}>{invoice.buyer.company_name}</div>
              <div style={{fontSize: '8px'}}>{invoice.buyer.address_line1}</div>
              <div style={{fontSize: '8px'}}>GSTIN: {invoice.buyer.gstin || 'N/A'}</div>
            </div>
            <div style={{border: '1px solid #000', padding: '3px'}}>
              <div style={{fontWeight: 'bold', marginBottom: '2px'}}>Terms of Delivery</div>
              <div style={{fontSize: '8px'}}>{invoice.destination || 'N/A'}</div>
              <div style={{fontSize: '8px'}}>Via: {invoice.dispatched_through || 'N/A'}</div>
            </div>
          </div>

          {/* Totals and Amounts */}
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', marginBottom: '4px', fontSize: '9px'}}>
            <div style={{border: '1px solid #000', padding: '3px'}}>
              <div><strong>Subtotal (before tax):</strong> {parseFloat(invoice.subtotal).toFixed(2)}</div>
              <div><strong>CGST Total:</strong> {parseFloat(invoice.total_cgst).toFixed(2)}</div>
              <div><strong>SGST Total:</strong> {parseFloat(invoice.total_sgst).toFixed(2)}</div>
              <div><strong>Round Off:</strong> {roundOff >= 0 ? '+' : ''}{roundOff.toFixed(2)}</div>
              <div style={{fontWeight: 'bold', fontSize: '10px'}}><strong>Grand Total:</strong> {parseFloat(invoice.grand_total).toFixed(2)}</div>
            </div>
            <div style={{border: '1px solid #000', padding: '3px'}}>
              <div style={{fontSize: '8px'}}><strong>Amount (in words):</strong></div>
              <div style={{fontSize: '9px', fontWeight: 'bold', marginTop: '2px'}}>{invoice.amount_in_words}</div>
            </div>
          </div>

          {/* HSN/SAC Summary */}
          <div style={{marginBottom: '4px', border: '1px solid #000', padding: '3px', fontSize: '8px'}}>
            <div style={{fontWeight: 'bold', marginBottom: '2px'}}>HSN/SAC Summary</div>
            <table>
              <tr>
                <td><strong>HSN/SAC</strong></td>
                <td style={{textAlign: 'center'}}><strong>Total Qty</strong></td>
                <td style={{textAlign: 'right'}}><strong>Taxable Value</strong></td>
                <td style={{textAlign: 'center'}}><strong>CGST Rate</strong></td>
                <td style={{textAlign: 'right'}}><strong>CGST Amt</strong></td>
                <td style={{textAlign: 'center'}}><strong>SGST Rate</strong></td>
                <td style={{textAlign: 'right'}}><strong>SGST Amt</strong></td>
                <td style={{textAlign: 'right'}}><strong>Total Tax</strong></td>
              </tr>
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.hsn_sac || '-'}</td>
                  <td style={{textAlign: 'center'}}>{item.quantity}</td>
                  <td style={{textAlign: 'right'}}>{parseFloat(item.amount).toFixed(2)}</td>
                  <td style={{textAlign: 'center'}}>9.00%</td>
                  <td style={{textAlign: 'right'}}>{(parseFloat(item.amount) * 0.09).toFixed(2)}</td>
                  <td style={{textAlign: 'center'}}>9.00%</td>
                  <td style={{textAlign: 'right'}}>{(parseFloat(item.amount) * 0.09).toFixed(2)}</td>
                  <td style={{textAlign: 'right'}}>{(parseFloat(item.amount) * 0.18).toFixed(2)}</td>
                </tr>
              ))}
            </table>
          </div>

          {/* Bank Details */}
          <div style={{marginBottom: '4px', border: '1px solid #000', padding: '3px', fontSize: '9px'}}>
            <div><strong>Company's Bank Details:</strong></div>
            <div style={{fontSize: '8px', marginTop: '2px'}}>Bank Name: State Bank of India</div>
            <div style={{fontSize: '8px'}}>A/c No.: 000000123456789</div>
            <div style={{fontSize: '8px'}}>Branch: Main Branch, Raipur</div>
            <div style={{fontSize: '8px'}}>IFSC Code: SBIN0000123</div>
          </div>

          {/* Declaration */}
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', fontSize: '8px'}}>
            <div style={{border: '1px solid #000', padding: '3px'}}>
              <div><strong>Declaration:</strong></div>
              <div style={{marginTop: '2px', lineHeight: '1.3'}}>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</div>
            </div>
            <div style={{border: '1px solid #000', padding: '3px', textAlign: 'right'}}>
              <div style={{marginBottom: '20px'}}>for VUK TRADERS (DUMMY)</div>
              <div style={{fontSize: '7px', borderTop: '1px solid #000', paddingTop: '2px'}}>Authorised Signatory</div>
            </div>
          </div>

          <div style={{textAlign: 'center', fontSize: '7px', marginTop: '2px', color: '#666'}}>This is a computer generated invoice.</div>
        </div>
      </div>
    </div>
  );
}

