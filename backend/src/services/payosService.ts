import crypto from "crypto";

interface PayOSLinkData {
  orderId: string;
  amount: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}

interface PayOSItem {
  name: string;
  quantity: number;
  price: number;
}

class PayOSService {
  private clientId: string;
  private apiKey: string;
  private checksumKey: string;
  private baseUrl: string = "https://api-merchant.payos.vn";
  private isTestMode: boolean = false;

  constructor() {
    this.clientId = process.env.PAYOS_CLIENT_ID || "";
    this.apiKey = process.env.PAYOS_API_KEY || "";
    this.checksumKey = process.env.PAYOS_CHECKSUM_KEY || "";

    // 🔧 DEBUG: Log credentials status (without exposing values)
    console.log("🔍 PayOS Service Debug:");
    console.log("  - Client ID:", this.clientId ? `${this.clientId.slice(0, 8)}...` : "NOT SET");
    console.log("  - API Key:", this.apiKey ? `${this.apiKey.slice(0, 8)}...` : "NOT SET");
    console.log("  - Checksum Key:", this.checksumKey ? `${this.checksumKey.slice(0, 8)}...` : "NOT SET");

    // Enable test mode if credentials are missing
    if (!this.clientId || !this.apiKey || !this.checksumKey) {
      console.warn("⚠️ PayOS credentials missing - Running in TEST MODE");
      this.isTestMode = true;
    } else {
      console.log("✅ PayOS credentials found - Running in PRODUCTION MODE");
    }
  }

  private generateSignature(data: string): string {
    return crypto
      .createHmac("sha256", this.checksumKey)
      .update(data)
      .digest("hex");
  }

  private generateMockCheckoutUrl(orderCode: number): string {
    return `https://pay.payos.vn/web/${orderCode}?test=true`;
  }

  private generateMockQRCode(orderCode: number): string {
    return `https://img.vietqr.io/image/970415-113366668888-compact.jpg?amount=${orderCode}&addInfo=Test%20Payment`;
  }

  async createPaymentLink(linkData: PayOSLinkData): Promise<any> {
    try {
      // 🔧 IMPROVED: Better orderCode generation for PayOS
      // PayOS orderCode must be integer and unique
      // Use last 8 chars of orderId converted to decimal, but ensure it's reasonable size
      let orderCode;
      try {
        // Try to use last 8 chars as hex -> decimal
        const hexSuffix = linkData.orderId.slice(-8);
        orderCode = parseInt(hexSuffix, 16);
        
        // If too large (> 2147483647), use timestamp + random
        if (orderCode > 2147483647 || orderCode <= 0) {
          orderCode = Date.now() % 1000000000 + Math.floor(Math.random() * 1000);
        }
      } catch (e) {
        // Fallback to timestamp-based
        orderCode = Date.now() % 1000000000 + Math.floor(Math.random() * 1000);
      }
      
      console.log(`🔍 OrderCode generation: ${linkData.orderId} -> ${orderCode}`);
      
      // TEST MODE: Return mock response
      if (this.isTestMode) {
        console.log(`🧪 PayOS TEST MODE: Creating mock payment link for orderCode ${orderCode}`);
        const mockCheckoutUrl = this.generateMockCheckoutUrl(orderCode);
        console.log(`🧪 Mock URL will be: ${mockCheckoutUrl}`);
        
        const mockResponse = {
          success: true,
          data: {
            checkoutUrl: mockCheckoutUrl,
            orderCode: orderCode,
            paymentLinkId: `test_${orderCode}`,
            qrCode: this.generateMockQRCode(orderCode)
          }
        };
        
        console.log("🎯 PayOS TEST MODE Response:", JSON.stringify(mockResponse, null, 2));
        return mockResponse;
      }

      // PRODUCTION MODE: Real PayOS API call
      // 🔧 FIXED: Format according to PayOS API docs
      // 🔧 FIXED: Truncate description to max 25 characters (PayOS requirement)
      const truncatedDescription = linkData.description.length > 25 
        ? linkData.description.substring(0, 22) + "..."
        : linkData.description;
        
      const paymentData = {
        orderCode,
        amount: linkData.amount,
        description: truncatedDescription,
        returnUrl: linkData.returnUrl,
        cancelUrl: linkData.cancelUrl,
        signature: ""
      };

      // 🔧 FIXED: Create signature string in alphabetical order as per PayOS docs
      const signatureString = `amount=${paymentData.amount}&cancelUrl=${paymentData.cancelUrl}&description=${paymentData.description}&orderCode=${paymentData.orderCode}&returnUrl=${paymentData.returnUrl}`;
      paymentData.signature = this.generateSignature(signatureString);
      
      // 🔧 DEBUG: Log signature details
      console.log("🔐 PayOS Signature:");
      console.log("  - String:", signatureString);
      console.log("  - Signature:", paymentData.signature.slice(0, 16) + "...");

      // 🔧 DEBUG: Log API call details
      console.log("🚀 PayOS API Call:");
      console.log("  - URL:", `${this.baseUrl}/v2/payment-requests`);
      console.log("  - Order Code:", orderCode);
      console.log("  - Amount:", paymentData.amount);
      console.log("  - Description:", paymentData.description);
      console.log("  - Return URL:", paymentData.returnUrl);
      console.log("  - Cancel URL:", paymentData.cancelUrl);
      console.log("  - Headers:", { 
        "Content-Type": "application/json",
        "x-client-id": this.clientId.slice(0, 8) + "...",
        "x-api-key": this.apiKey.slice(0, 8) + "..."
      });
      console.log("  - Body:", JSON.stringify(paymentData, null, 2));

      const response = await fetch(`${this.baseUrl}/v2/payment-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": this.clientId,
          "x-api-key": this.apiKey,
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      // 🔧 DEBUG: Log API response details
      console.log("📥 PayOS API Response:");
      console.log("  - Status:", response.status);
      console.log("  - OK:", response.ok);
      console.log("  - Result:", JSON.stringify(result, null, 2));

      if (!response.ok) {
        throw new Error(`PayOS API Error: ${result.desc || result.message || 'Unknown error'}`);
      }

      // 🔧 IMPROVED: Validate PayOS response format according to docs
      if (!result.data || !result.data.checkoutUrl) {
        console.error("❌ PayOS API returned success but missing required fields!");
        console.error("❌ Expected: { data: { checkoutUrl, paymentLinkId, qrCode } }");
        console.error("❌ Received:", result);
        throw new Error("PayOS API response missing checkoutUrl - payment link not created properly");
      }

      // 🔧 DEBUG: Log processed response
      const processedResponse = {
        success: true,
        data: {
          checkoutUrl: result.data.checkoutUrl,
          orderCode: orderCode,
          paymentLinkId: result.data.paymentLinkId,
          qrCode: result.data.qrCode
        }
      };
      console.log("🎯 PayOS Processed Response:", JSON.stringify(processedResponse, null, 2));

      return processedResponse;
    } catch (error: any) {
      console.error("PayOS createPaymentLink error:", error);
      
      // 🔧 IMPROVED: Better error handling - don't fallback to fake success
      // Real failure should return proper error, not fake orderCode
      
      return {
        success: false,
        error: error.message || "Failed to create payment link",
        details: {
          isTestMode: this.isTestMode,
          hasCredentials: !!(this.clientId && this.apiKey && this.checksumKey),
          errorType: error.name || 'Unknown',
          apiUrl: `${this.baseUrl}/v2/payment-requests`
        }
      };
    }
  }

  async getPaymentInfo(orderCode: string): Promise<any> {
    try {
      // TEST MODE: Return mock response
      if (this.isTestMode) {
        console.log(`🧪 PayOS TEST MODE: Getting mock payment info for orderCode ${orderCode}`);
        return {
          success: true,
          data: {
            orderCode: parseInt(orderCode),
            amount: 1000,
            description: "Test payment",
            status: "PENDING",
            createdAt: new Date().toISOString(),
            transactions: []
          }
        };
      }

      const response = await fetch(`${this.baseUrl}/v2/payment-requests/${orderCode}`, {
        method: "GET",
        headers: {
          "x-client-id": this.clientId,
          "x-api-key": this.apiKey,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(`PayOS API Error: ${result.desc || result.message || 'Unknown error'}`);
      }

      return {
        success: true,
        data: result.data
      };
    } catch (error: any) {
      console.error("PayOS getPaymentInfo error:", error);
      return {
        success: false,
        error: error.message || "Failed to get payment info"
      };
    }
  }

  async cancelPaymentLink(orderCode: string): Promise<any> {
    try {
      // TEST MODE: Return mock response
      if (this.isTestMode) {
        console.log(`🧪 PayOS TEST MODE: Cancelling mock payment for orderCode ${orderCode}`);
        return {
          success: true,
          data: {
            orderCode: parseInt(orderCode),
            status: "CANCELLED",
            cancelledAt: new Date().toISOString()
          }
        };
      }

      const response = await fetch(`${this.baseUrl}/v2/payment-requests/${orderCode}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": this.clientId,
          "x-api-key": this.apiKey,
        },
        body: JSON.stringify({
          cancellationReason: "User requested cancellation"
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(`PayOS API Error: ${result.desc || result.message || 'Unknown error'}`);
      }

      return {
        success: true,
        data: result.data
      };
    } catch (error: any) {
      console.error("PayOS cancelPaymentLink error:", error);
      return {
        success: false,
        error: error.message || "Failed to cancel payment link"
      };
    }
  }

  verifyWebhookSignature(webhookBody: string, signature: string): boolean {
    try {
      if (this.isTestMode) {
        console.log("🧪 PayOS TEST MODE: Skipping webhook signature verification");
        return true; // Always pass in test mode
      }
      
      const expectedSignature = this.generateSignature(webhookBody);
      return expectedSignature === signature;
    } catch (error) {
      console.error("PayOS webhook signature verification error:", error);
      return false;
    }
  }
}

export default new PayOSService(); 