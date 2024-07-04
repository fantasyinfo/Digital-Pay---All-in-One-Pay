export default class PaymentResponse {
    constructor(payUrl, data, transaction) {
      if (!payUrl || !data || !transaction) {
        throw new Error('Missing required details');
      }
      this.payUrl = payUrl;
      this.data = data;
      this.transaction = transaction;
    }
  
    getResponse() {
      return {
        payUrl: this.payUrl,
        data: this.data,
        transaction: this.transaction,
      };
    }
  }