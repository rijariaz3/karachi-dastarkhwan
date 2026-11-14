# Karachi Dastarkhwan

A front-end online food ordering website for a Karachi restaurant, built with plain HTML, CSS and JavaScript. No frameworks, no build step, no server.

## Features
- 32 dishes in 5 categories (BBQ & Karahi, Biryani & Rice, Desi Breakfast, Desserts, Drinks), each with name, description, price in Rs., category, availability and picture
- Browse by category, search, add to cart, change quantity, remove items
- Subtotal, 5% GST, Rs. 150 delivery fee and final total calculated automatically
- Checkout asks only for name and a Pakistani mobile number (Cash on Delivery, simulated)
- Orders get a unique number (#1001, #1002, ...) and are kept as order history
- Customers can track an order: Received, Preparing, Ready, Completed or Cancelled
- Kitchen / Admin tab: move orders through statuses and mark dishes sold out or available
- Light and dark mode, works on phones

## Files
| File | Purpose |
|---|---|
| `index.html` | Page structure |
| `style.css` | Design |
| `script.js` | Menu data, cart, orders and screens |

## Run it
Download the three files into one folder and open `index.html` in a browser.

## Note
Data (cart, orders, availability) is stored in the browser's `localStorage`, so it stays on one device. A full system would need a server and a shared database.
