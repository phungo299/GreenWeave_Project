# Booking Flow QA Test Plan

**Scope**: End-to-end user journey from browsing product → add to cart → checkout → payment → email confirmation.

## 1. Pre-conditions
- Test account (registered & verified email)
- At least 2 products in stock (with variants)
- Payment gateway sandbox credentials
- Mailtrap / Mailhog configured for email capture

## 2. Happy Path
| Step | Action | Expected Result |
|------|--------|-----------------|
|1|Navigate to Landing page|Page loads, no console errors|
|2|Select Product A, open detail|Detail info displays correctly|
|3|Choose Size, Color, Qty 2, Click **Add to Cart**|Toast success, header cart count increases by 2 instantly|
|4|Click **Cart** icon|Cart page shows Product A with qty 2|
|5|Click **Checkout / Thanh toán**|Checkout page loads, order summary correct|
|6|Enter shipping info & continue|Validation passes|
|7|Select payment method (Sandbox)|Redirect/iframe loads|
|8|Complete payment|Redirect back to success page, order ID shown|
|9|Open email inbox|Confirmation email received with correct details|

## 3. Negative / Edge Cases
1. **Stock Limit Exceeded**
   - Set product stock = 1, attempt to add qty 2 → Toast warning, qty clamp.
2. **Unauthenticated Checkout**
   - Logout, click **Buy Now** → Redirect to login, after login returns to cart.
3. **Payment Failure**
   - Use failure card → App shows payment failed UI, order not created.
4. **Network Timeout**
   - Throttle network on add-to-cart → UI keeps optimistic item, then rollback & toast error.
5. **API 500**
   - Mock 500 on `/cart` GET → Error boundary shows graceful error + retry.

## 4. Performance
- Add 30 items, cart operations remain <100 ms DOM updates.
- No dropped frames during animations.

## 5. Accessibility
- Keyboard traversal of checkout forms.
- ARIA labels on cart & payment buttons.

## 6. Post-conditions
- DB: `orders` table has new record (happy path).
- `cart` collection cleared after successful checkout.

## 7. Tools
- Cypress e2e (`cypress/e2e/booking_flow.cy.js`)
- Lighthouse perf audit
- Axe-core for accessibility

## 8. Status Tracking
- Update task #1 in TaskMaster when each section passes. 