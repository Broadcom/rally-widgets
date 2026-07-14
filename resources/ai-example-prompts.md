
# Sample Prompts

Usage examples for the two standalone skills in this folder. These prompts are designed to be pasted directly into an agent chat.

---

## App Deconstructor

The App Deconstructor reads an old Rally SDK/ExtJS Custom HTML app and produces a `blueprint.md` behavioral specification. Use it as the first step before building a new widget.

### Provide a single HTML file

```
Read the skill at @rally-widgets/resources/ai-rally-app-deconstructor.md and follow it exactly to create a blueprint for the app @legacy-apps/my-old-app.html
```

---

### Provide a folder with multiple files

```
Read the skill at rally-widgets/resources/ai-rally-app-deconstructor.md and follow it exactly.

The old app folder is at: /path/to/my-old-app/
Please read every .html, .js, and .css file in that folder before analyzing.
```

---

### With output location specified

```
Read the skill at rally-widgets/resources/ai-rally-app-deconstructor.md and follow it exactly.

The old app folder is at: /path/to/my-old-app/
Save the blueprint.md output to: /path/to/my-old-app/blueprint.md
```

---

### What to expect

The App Deconstructor will:
1. Read all app files
2. Identify the SDK framework pattern
3. Extract: data loaded, settings fields, ViewFilter handling, rendering components, user interactions, error/loading states
4. Produce a structured `blueprint.md` document
5. Ask you to confirm the blueprint before proceeding

After confirmation, the blueprint is ready to pass to the Widget Builder.

---

## Widget Builder

The Widget Builder reads a `blueprint.md` specification and generates a complete Rally HTML Widget project (`widget.html`, `widget.js`, `widget.css` plus build scaffolding).

### Provide a blueprint file path

```
Read the skill at skills/ai-rally-widget-builder.md and follow it exactly.

The blueprint is at: /path/to/my-old-app/blueprint.md
Output the widget project to: /path/to/my-new-widget/
```

---

### Provide a blueprint file and specify the closest analog

```
Read the skill at rally-widgets/resources/ai-rally-widget-builder.md and follow it exactly.

The blueprint is at: /path/to/my-old-app/blueprint.md
Output the widget project to: /path/to/my-new-widget/
The closest endorsed widget analog is: pi-cycle-time-chart
```

---

### Paste the blueprint directly

```
Read the skill at rally-widgets/resources/ai-rally-widget-builder.md and follow it exactly.

Here is the blueprint:

[paste the contents of blueprint.md here]

Output the widget project to: /path/to/my-new-widget/
```

---

### Specify single-file deployment output

```
Read the skill at rally-widgets/resources/ai-rally-widget-builder.md and follow it exactly.

The blueprint is at: /path/to/blueprint.md
I want the output as a single-file deployment HTML (everything inlined), not a dev environment.
Output to: /path/to/my-new-widget/
```

---

## End-to-End: Deconstruct Then Build

Run both skills in sequence for a complete conversion in two confirmed steps.

### Step 1 — Deconstruct

```
Read the skill at rally-widgets/resources/ai-rally-app-deconstructor.md and follow it exactly.

The old app folder is at: /path/to/my-old-app/
Save the blueprint to: /path/to/my-old-app/blueprint.md
```

Review the blueprint. Correct anything that is inaccurate. Confirm when ready.

### Step 2 — Build

```
Read the skill at rally-widgets/resources/ai-rally-widget-builder.md and follow it exactly.

The blueprint is at: /path/to/my-old-app/blueprint.md
Output the widget project to: /path/to/my-new-widget/
```

---

## Tips

- **Correcting the blueprint:** After the App Deconstructor produces the blueprint, tell it exactly what is wrong before confirming. For example: *"The chart type should be 'column', not 'bar'. The Release filter is not optional — it is always required."*

- **Skipping the deconstructor:** If you already have a clear description of what you want the widget to do, you can write your own `blueprint.md` and pass it directly to the Widget Builder. It does not need to come from the App Deconstructor — any document that covers the sections in the blueprint format will work.

- **Settings-only re-run:** If you only need to adjust the settings UI of an already-generated widget, you can prompt: *"Read skills/ai-rally-widget-builder.md. Update only the `renderSettingsUI` function in `/path/to/widget.js` to add a [dropdown/toggle] for [setting name]."*
