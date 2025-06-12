# Flowy

A React Flow–based visual editor for building and testing dynamic conversation flows.

## DEMO


https://github.com/user-attachments/assets/b8c602d1-e57b-4b8e-8c80-d1fa6a2e37df


## Project Structure
```
src/
├── app/               
│ ├── page.tsx         # page layout
│ └── layout.tsx       # Global layout
├── components/        
│ ├── nodes/           # Custom node types (conversation, function, etc.)
│ ├── modals/          # Configuration modals for each node
│ ├── ui/              # ShadCN components
│ ├── TopMenu.tsx      
│ ├── RightSidebar.tsx 
│ └── HelpButton.tsx   
├── lib/               
public/
```
---

## Functionality

- Drag and drop nodes to build a flow.
- Supports multiple node types:
  - Conversation
  - Call Transfer
  - Function Execution
  - Press Digit
  - End Call
- Edit node settings and config them via modals.
- Connect and disconnect nodes dynamically.
- Save flow state to local storage.
- Test flow with step-by-step validation.
- Beautiful UI with animations and real-time feedback.
- Hover tooltips and keyboard shortcuts for usability.

---

## Getting Started

### Installation

1. Clone the repository:

   ```
   git clone [https://github.com/Dksie09/sarvam](https://github.com/Dksie09/sarvam)
   ```
   cd into the folder

2. Install dependencies:

   ```
   npm install
   ```

3. Start the development server:

   ```
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Technologies Used

- Nextjs
- React Flow
- TypeScript
- Tailwind CSS
- Radix UI + ShadCN
- Lucide Icons

## Disclaimer

This project was created as part of a [frontend assignment](https://www.notion.so/sarvamai/Frontend-Assignment-17d39c96b62d80238a27fbaef118aa37) for Sarvam.ai.

## License

This project is open source and available under the [MIT License](LICENSE).
