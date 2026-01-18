# 🎓 Complete Beginner's Guide: React + Next.js + Tailwind

You know **Java** and **JavaScript + Three.js**. Here's how React, Next.js, and Tailwind fit together in your hackathon app.

---

## 📚 PART 1: The Big Picture

### What Each Technology Does

**React** = Building reusable UI components (like Java classes, but for UI)
- Think: A button class in Java → A button component in React
- Instead of writing HTML repeatedly, you create reusable pieces

**Next.js** = Framework that runs React (handles routing, builds, server stuff)
- Think: Spring Boot for Java → Next.js for React
- Handles all the infrastructure so you can focus on features

**Tailwind** = Utility-first CSS (write styles directly in your HTML)
- Think: Instead of separate CSS files, you write `className="bg-red-500 px-4"`
- Like inline styles, but better organized and standardized

---

## 🧩 PART 2: React Concepts (You're Already Using These!)

### 2.1 Components = Reusable UI Functions

**In Java, you'd have:**
```java
public class Button {
    private String text;
    public void render() { /* render button */ }
}
```

**In React (JavaScript), it's:**
```jsx
function Button({ text }) {
  return <button>{text}</button>;
}
```

**In YOUR code (`Header.tsx`):**
```jsx
export default function Header() {  // ← This is a component (like a class)
  return (
    <header>                        // ← Returns HTML-like "JSX"
      {/* Your header content */}
    </header>
  );
}
```

**Key Insight:** 
- `export default` = "this is the main thing this file exports" (like `public static void main`)
- Components are **functions that return JSX** (HTML-like code)
- JSX looks like HTML but it's JavaScript

---

### 2.2 JSX = HTML Inside JavaScript

**Regular JavaScript:**
```javascript
const element = document.createElement('div');
element.textContent = 'Hello';
```

**JSX (React way):**
```jsx
const element = <div>Hello</div>;  // ← This is JSX!
```

**In YOUR code (`Header.tsx` line 17-18):**
```jsx
return (
  <header className="w-full bg-white...">  // ← JSX: HTML tags in JavaScript!
    <div className="flex items-center...">
```

**Rules:**
- Use `className` instead of `class` (because `class` is a JavaScript keyword)
- Self-closing tags need `/`: `<div />` not `<div>`
- You can use `{}` to insert JavaScript: `<div>{variable}</div>`

---

### 2.3 Props = Parameters Passed to Components

**In Java:**
```java
public void greet(String name) {
    System.out.println("Hello " + name);
}
```

**In React:**
```jsx
function Greet({ name }) {  // ← Props = function parameters
  return <div>Hello {name}</div>;
}

// Usage:
<Greet name="Alice" />  // ← Pass props like attributes
```

**In YOUR code (`MainLayout.tsx` line 25-36):**
```jsx
function SectionButton({ label, color, indicators, isActive, onClick }) {
  // ↑ These are "props" - data passed from parent
  return (
    <button onClick={onClick}>  {/* onClick is a function prop */}
      {label}                    {/* Display the label prop */}
    </button>
  );
}

// Usage (line 64-69):
<SectionButton
  label="Environment"    // ← Prop 1
  color="red"            // ← Prop 2
  indicators={5}         // ← Prop 3 (number)
  isActive={environmentActive}  // ← Prop 4 (boolean)
  onClick={() => setEnvironmentActive(!environmentActive)}  // ← Prop 5 (function)
/>
```

**Key Insight:** Props flow **down** from parent to child (like passing arguments)

---

### 2.4 State = Component's Memory (Variables That Trigger Re-renders)

**In Java, you'd have:**
```java
private boolean isActive = false;
public void toggle() {
    isActive = !isActive;
    repaint();  // Manual re-render
}
```

**In React with `useState`:**
```jsx
const [isActive, setIsActive] = useState(false);  // ← State hook

function toggle() {
  setIsActive(!isActive);  // ← Automatically re-renders!
}
```

**In YOUR code (`MainLayout.tsx` line 56-57):**
```jsx
const [environmentActive, setEnvironmentActive] = useState(true);
const [objectsActive, setObjectsActive] = useState(false);

// Later, when you click (line 69):
onClick={() => setEnvironmentActive(!environmentActive)}
//              ↑ This updates state → Component re-renders automatically
```

**Breaking Down `useState`:**
```jsx
const [value, setValue] = useState(initialValue);
//  ↑      ↑        ↑              ↑
//  |      |        |              └─ Starting value
//  |      |        └─ Function to change value (like a setter)
//  |      └─ Current value (like a getter)
//  └─ Array destructuring (gets both at once)
```

**When state changes → React automatically re-renders that component**

---

### 2.5 Event Handlers = Functions That Run on User Actions

**In JavaScript (what you know):**
```javascript
button.addEventListener('click', function() {
  console.log('Clicked!');
});
```

**In React:**
```jsx
<button onClick={() => console.log('Clicked!')}>
  Click me
</button>
```

**In YOUR code (`MainLayout.tsx` line 32-33):**
```jsx
<button
  onClick={onClick}  // ← onClick prop contains a function
>
```

**Two ways to write event handlers:**

1. **Inline arrow function:**
```jsx
onClick={() => setEnvironmentActive(!environmentActive)}
```

2. **Named function:**
```jsx
function handleClick() {
  setEnvironmentActive(!environmentActive);
}
// ...
onClick={handleClick}  // ← No parentheses! We pass the function, not call it
```

---

## 🎨 PART 3: Tailwind CSS (Utility-First Styling)

### 3.1 Basic Concept: Classes = Styles

**Old CSS way (separate file):**
```css
/* styles.css */
.red-button {
  background-color: red;
  padding: 10px;
  border-radius: 5px;
}
```

```html
<button class="red-button">Click</button>
```

**Tailwind way (utility classes):**
```jsx
<button className="bg-red-500 px-4 py-2 rounded-lg">Click</button>
//                 ↑         ↑    ↑    ↑
//                 |         |    |    └─ Border radius
//                 |         |    └─ Vertical padding
//                 |         └─ Horizontal padding
//                 └─ Background color
```

---

### 3.2 Common Tailwind Classes (From YOUR Code)

**Colors:**
```jsx
className="bg-red-600"     // Background: red-600 shade
className="text-white"     // Text color: white
className="border-gray-400" // Border color: gray-400
```

**Spacing:**
```jsx
className="px-4"    // Padding horizontal: 1rem (16px)
className="py-2"    // Padding vertical: 0.5rem (8px)
className="gap-2"   // Gap between children: 0.5rem
className="m-4"     // Margin all sides: 1rem
```

**Layout:**
```jsx
className="flex"           // Display: flex (horizontal layout)
className="flex-col"       // Flex direction: column (vertical)
className="grid grid-cols-2" // Grid with 2 columns
className="items-center"   // Align items vertically center
className="justify-between" // Space items apart
```

**Sizing:**
```jsx
className="w-full"         // Width: 100%
className="h-16"           // Height: 4rem (64px)
className="min-h-screen"   // Minimum height: 100vh
```

**Borders & Effects:**
```jsx
className="border-2 border-dashed" // 2px dashed border
className="rounded-full"          // Fully rounded (pill shape)
className="shadow-sm"             // Small shadow
```

**In YOUR code (`Header.tsx` line 17):**
```jsx
<header className="w-full bg-white border-b border-gray-200 shadow-sm">
//      ↑          ↑       ↑        ↑        ↑           ↑
//      |          |       |        |        |           └─ Shadow
//      |          |       |        |        └─ Bottom border color
//      |          |       |        └─ Bottom border
//      |          |       └─ White background
//      |          └─ Full width
//      └─ Tailwind classes (all styles in one place!)
```

---

### 3.3 Hover & Transitions (Interactive States)

**In YOUR code (`Header.tsx` line 48):**
```jsx
className="text-black hover:opacity-70 transition-opacity"
//                           ↑              ↑
//                           |              └─ Smooth transition
//                           └─ When hovered, reduce opacity
```

**Common state modifiers:**
- `hover:` = When mouse hovers
- `focus:` = When focused (keyboard/Tab)
- `active:` = When clicked/pressed
- `disabled:` = When disabled

---

### 3.4 Conditional Classes (Dynamic Styling)

**In YOUR code (`MainLayout.tsx` line 44-45):**
```jsx
className={`w-3 h-3 ${indicatorColor} rounded-full ${
  isActive ? 'opacity-100' : 'opacity-70'
}`}
//         ↑                         ↑
//         |                         └─ Ternary: if isActive, full opacity, else 70%
//         └─ Template literal (backticks) allows ${} interpolation
```

**Template Literals (JavaScript concept):**
```javascript
// Old way:
"Hello " + name + "!"

// Template literal:
`Hello ${name}!`  // ← Backticks, ${} for variables
```

---

## 🚀 PART 4: Next.js Concepts

### 4.1 File-Based Routing

**In Java Spring Boot:**
```
@GetMapping("/about")
public String about() { return "about.html"; }
```

**In Next.js:**
```
app/
  page.tsx          → Route: /
  about/
    page.tsx        → Route: /about
```

**YOUR structure:**
```
app/
  page.tsx          → Homepage (/)
  components/
    Header.tsx      → Component (not a route)
    MainLayout.tsx  → Component (not a route)
```

**Key Rule:** `page.tsx` files = routes. Other files = components/utilities.

---

### 4.2 'use client' Directive

**In YOUR code (every component file):**
```jsx
'use client';  // ← Must be first line

export default function Header() { ... }
```

**Why?**
- **Server Components** (default in Next.js 13+): Render on server (faster, no JavaScript needed)
- **Client Components** (`'use client'`): Need interactivity (useState, onClick, etc.)

**Rule of thumb:**
- Use `'use client'` if you have: `useState`, `onClick`, browser APIs
- Omit it for: Static content, server data fetching

---

### 4.3 Import/Export System

**Like Java imports:**
```java
import java.util.List;
```

**In JavaScript/React:**
```jsx
import React from 'react';                    // Default import
import { useState } from 'react';            // Named import
import Header from './components/Header';    // Local file import
```

**In YOUR code (`page.tsx`):**
```jsx
import React from 'react';
import Header from './components/Header';    // ← Your component
import MainLayout from './components/MainLayout';  // ← Your component
```

**Export types:**
```jsx
// Default export (one per file):
export default function Header() { ... }

// Named export (multiple per file):
export function LoadingSpinner() { ... }
export function PulseLoader() { ... }

// Usage:
import LoadingSpinner, { PulseLoader } from './LoadingSpinner';
```

---

## 🔄 PART 5: Data Flow (How Everything Connects)

### 5.1 Component Tree

```
Home (page.tsx)
  ├── Header
  │     ├── Logo SVG
  │     ├── LEGO Pattern Bar
  │     └── Icon Links
  │
  └── MainLayout
        ├── Environment Section
        │     └── SectionButton
        │           ├── Button
        │           └── Indicator Dots
        └── Objects Section
              └── SectionButton
```

---

### 5.2 State Flow Example

**In YOUR code (`MainLayout.tsx`):**

```jsx
// 1. State declared at top level
const [environmentActive, setEnvironmentActive] = useState(true);

// 2. State passed DOWN as prop
<SectionButton
  isActive={environmentActive}  // ← State flows down
  onClick={() => setEnvironmentActive(!environmentActive)}  // ← Setter passed down
/>

// 3. Child component uses prop
function SectionButton({ isActive, onClick }) {
  return (
    <button onClick={onClick}>  {/* ← Call setter when clicked */}
      {/* ... */}
    </button>
  );
}

// Flow:
// User clicks → onClick() called → setEnvironmentActive() called →
// State updates → Component re-renders → isActive prop updates →
// UI updates automatically! ✨
```

---

## 🎯 PART 6: Common Patterns in YOUR Code

### Pattern 1: Conditional Rendering

```jsx
{isActive ? 'opacity-100' : 'opacity-70'}  // Ternary operator
```

**Similar to Java:**
```java
String result = isActive ? "active" : "inactive";
```

---

### Pattern 2: Array.map() for Lists

**In YOUR code (`MainLayout.tsx` line 40):**
```jsx
{Array.from({ length: indicators }).map((_, i) => (
  <button key={i} ... />
))}
```

**Breaking it down:**
```javascript
// 1. Create array: [0, 1, 2, 3, 4] (if indicators = 5)
Array.from({ length: 5 })

// 2. Map each to a button element
.map((_, i) => (
  // _ = current item (we ignore it)
  // i = index (0, 1, 2, 3, 4)
  <button key={i}>...</button>
))
```

**Important:** Always include `key` prop when mapping (React needs it for performance)

---

### Pattern 3: Template Literals for Dynamic Classes

**In YOUR code (`MainLayout.tsx` line 33):**
```jsx
className={`${bgColor} text-white px-6 py-2 rounded-full ...`}
```

**Equivalent to:**
```javascript
const fullClass = bgColor + " text-white px-6 py-2 rounded-full";
// Or:
const fullClass = `${bgColor} text-white px-6 py-2 rounded-full`;
```

---

## 🛠️ PART 7: Debugging Tips

### 1. Console.log() Works!
```jsx
function Header() {
  console.log("Header rendered!");  // ← Check browser console
  return <header>...</header>;
}
```

### 2. React DevTools
- Install browser extension
- Inspect component tree, props, state

### 3. Common Errors

**"Cannot find module 'react'"**
→ Run `npm install` in `frontend/` directory

**"Unexpected token <"**
→ JSX syntax error, check your HTML-like tags

**"Cannot read property of undefined"**
→ Props not passed correctly, check parent component

---

## 🎓 PART 8: What to Learn Next

1. **useEffect hook** - Run code after render (like componentDidMount)
2. **useContext** - Share data across components (like global state)
3. **Custom hooks** - Reusable logic (like helper functions)
4. **API calls** - Fetch data from your backend
5. **Forms** - Handle user input (controlled components)
6. **Three.js integration** - You already know Three.js! Connect it to React

---

## 🚀 Quick Reference: Your Tech Stack

| Technology | Purpose | File Types |
|------------|---------|------------|
| **React** | UI components | `.tsx`, `.jsx` |
| **Next.js** | Framework/routing | `page.tsx` = routes |
| **Tailwind** | Styling | `className="..."` |
| **TypeScript** | Type safety | `.ts`, `.tsx` (adds types to JS) |
| **Three.js** | 3D graphics | Already know this! |

---

## 💡 Key Takeaways

1. **Components** = Reusable UI functions
2. **Props** = Data passed down (parent → child)
3. **State** = Component memory (triggers re-renders)
4. **JSX** = HTML in JavaScript
5. **Tailwind** = Write styles as classes (`className="..."`)
6. **Next.js** = Handles routing, builds, server stuff

**You're ready to build!** 🎉

If you get stuck, ask: "Where does this data come from?" (props/state) and "Where should I put this code?" (which component/file).
