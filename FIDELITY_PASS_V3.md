# Fidelity pass v3

Source of truth: TreehouzeDemo_NoraConnectorFlow_v31.

Key changes from the first web port:
- Rebuilt dimensions and spacing from the SwiftUI source rather than approximating the WhatsApp look.
- Added iPhone-style status/safe-area treatment and home indicator.
- Matched Swift header height, Treehouze avatar, green actions, business/typing status.
- Removed the artificial wallpaper dot pattern; chat background now matches the Swift flat WhatsApp wallpaper color.
- Security notice is the same mint card used by the Swift demo.
- Message typography increased to the Swift body size; incoming/outgoing bubbles use Swift width caps and padding.
- Selected interactive reply remains visible in gray, and the outgoing reply includes the quoted Treehouze prompt.
- Interactive messages use the same 320pt-style width, 18pt radius, separators, green reply arrows/text.
- Contact cards, location cards, calendar cards and composer were resized to mirror Swift components.
- Typing is represented in the header, matching the Swift build instead of showing a separate typing bubble.
- Inbox copy and row sizing now match the v31 Swift source.
- Desktop restart control stays outside the simulated phone and is hidden on mobile.
