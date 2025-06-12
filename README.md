# Flowp

A React Flow–based visual editor for building and testing dynamic conversation flows.

## DEMO

---

## Project Structure

src/
├── app/ # Next.js App Directory
│ ├── page.tsx # Main flow editor page
│ └── layout.tsx # Global layout with fonts and Toaster
├── components/ # UI components and node UIs
│ ├── nodes/ # Custom node types (conversation, function, etc.)
│ ├── modals/ # Configuration modals for each node
│ ├── ui/ # ShadCN/Radix-styled UI primitives
│ ├── TopMenu.tsx # Top bar with Save/Test options
│ ├── RightSidebar.tsx # Node library sidebar
│ └── HelpButton.tsx # Floating help with tips
├── lib/  
public/

---

## Functionality

- Drag and drop nodes to build a flow visually.
- Supports multiple node types:
  - Conversation
  - Call Transfer
  - Function Execution
  - Press Digit
  - End Call
- Edit node settings via modals.
- Connect and disconnect nodes dynamically.
- Save flow state to local storage.
- Test flow with step-by-step validation.
- Beautiful UI with animations and real-time feedback.
- Hover tooltips and keyboard shortcuts for usability.

---

## Getting Started

### 1. Clone the Repo

`git clone https://github.com/Dksie09/sarvam` 2. Install Dependencies
`npm install` 3. Start the Development Server
`npm run dev`
Open http://localhost:3000 in your browser to start building flows.

## Technologies Used

Nextjs

React Flow

TypeScript

Tailwind CSS

Radix UI + ShadCN

Lucide Icons

## Disclaimer

This project was created as part of a frontend assignment for Sarvam.ai.

## License

This project is open source and available under the MIT License.

```

```
