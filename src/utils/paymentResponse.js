export class PaymentResponse {
  constructor(payUrl, data, initId, gatewayId) {
   
 
    if (!payUrl || !data || !initId || !gatewayId) {
      throw new Error("Missing required details");
    }
    this.payUrl = payUrl;
    this.data = data;
    this.initId = initId;
    this.gatewayId = gatewayId;
  }

  getResponse() {
    return {
      payUrl: this.payUrl,
      _initId: this.initId,
      _gatewayId: this.gatewayId,
      data: this.data,
    };
  }
}

export class StatusResponse {
  constructor(status, data) {
    if (!status || !data) {
      throw new Error("Missing required details");
    }
    this.status = status;
    this.data = data;
  }

  getResponse() {
    return {
      status: this.status,
      data: this.data,
    };
  }
}
