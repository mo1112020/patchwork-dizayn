# Commerce & Payment Workflow

The application is structured for a professional custom rug commerce flow. The initial infrastructure for order management is now live in the **Admin Dashboard** and **User Profile**.

## Current Implementation

- **Order Creation**: When a user applies their design, an order is created in the `orders` table with status `pending` (Price Requested).
- **Communication Loop**:
    - **Admin**: Can view orders, update statuses, add notes, and enter tracking numbers.
    - **User**: Can view their order history and live status in their **Profile > My Orders** tab.
- **Support**: Phone number and client name are mandatory during design setup to ensure valid leads.

## Planned Payment Integration

The final step for full automation is integrating a 3rd-party payment provider (e.g., Stripe, Iyzico).

1.  **Checkout Step**: Replace the "Fiyat İste" (Request Price) button or add a new "Buy Now" button.
2.  **Payment Collection**: 
    - Use the calculated `totalPrice` from the designer.
    - Collect Shipping Address during the provider's checkout session.
3.  **Post-Purchase**:
    - Automatic status update to `Paid / Processing`.
    - Trigger PDF generation as a receipt or manufacturing spec.

## Database Integration

The `orders` table now stores:
- `user_id`: Reference to the customer.
- `design_id`: Link to the rug design.
- `design_snapshot`: JSON copy of the design state (prevents loss if the original design is edited/deleted).
- `status`: Lifecycle of the order.
- `tracking_number`: Logistics tracking.
- `admin_note`: Customer feedback.

## Development Hook

- **Designer Page**: The `createOrder` hook in `src/hooks/useOrders.ts` handles the database entry. This is where the manual payment gateway redirect should be integrated.
