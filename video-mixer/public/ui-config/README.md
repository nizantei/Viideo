# UI Configuration Files

This folder contains all configuration files that control the visual appearance and layout of the video mixer app.

## 📁 Files Overview

| File | Controls | Hot Reload |
|------|----------|------------|
| **layout.json** | Position & size of all UI elements | After page reload |
| **theme.json** | Colors, gradients, shadows, effects | After page reload |
| **typography.json** | Fonts, sizes, weights, spacing | After page reload |
| **animations.json** | Transitions, transforms, keyframes | After page reload |
| **spacing.json** | Padding, margins, gaps | After page reload |

## 🎨 Making Changes

1. **Open any config file** in a text editor
2. **Find the property** you want to change (look for comment fields starting with `_`)
3. **Edit the value** (not the comment field)
4. **Save the file**
5. **Reload the page** in your browser

## 📝 Understanding Comments

Each config file includes built-in documentation using special comment fields (starting with `_`):

```json
{
  "_description": "What this file does",
  "actualProperty": "actualValue",
  "_actualProperty": "Comment explaining what actualProperty does"
}
```

**Important:** The fields starting with `_` are comments. Only edit the fields WITHOUT underscores.

## 🔍 Example: Changing a Color

**Before:**
```json
"colors": {
  "_background": "Main background color for the entire app",
  "background": "#0a0a0f"
}
```

**After (making it lighter):**
```json
"colors": {
  "_background": "Main background color for the entire app",
  "background": "#1a1a2f"
}
```

## 🎯 Common Tasks

### Change Background Color
Edit `theme.json` → `colors.background`

### Change Button Text Size
Edit `typography.json` → `fontSize.base`

### Move an Element
Edit `layout.json` → Find element by `id` → Change `rect.x` or `rect.y`

### Adjust Animation Speed
Edit `animations.json` → `transitions.normal.duration`

### Change Spacing
Edit `spacing.json` → `scale` values

## ⚠️ Validation

If you make a mistake, the app will show a helpful error message explaining what's wrong. Common issues:

- **Missing comma** - JSON requires commas between properties
- **Missing quotes** - Strings must be in quotes: `"value"`
- **Trailing comma** - Remove commas after the last item
- **Invalid number** - Use `0.5` not `.5`, use `0` not `0.`

## 🚀 Advanced Tips

1. **Keep backups** - Copy config files before making major changes
2. **Test incrementally** - Change one thing at a time and reload
3. **Use the scale** - Stick to values from spacing.json for consistency
4. **Respect safe areas** - Keep UI elements inside safe zones for mobile compatibility
5. **Check all screen sizes** - Test on different viewport sizes if possible

## 🛠️ Technical Details

- **Coordinate system (layout.json)**: 0.0 to 1.0 (0% to 100% of viewport)
- **Colors**: Hex (#fff), RGB (rgb(255,255,255)), RGBA (rgba(255,255,255,0.5))
- **Durations**: Milliseconds (1000ms = 1 second)
- **Z-index range**: 1-100 (higher = on top)

## 📚 Need Help?

Open any config file and read the `_description` and comment fields. They explain:
- What each property does
- Valid value ranges
- Where the property is used in the app
- Examples and tips

---

**Note:** Changes require a page reload to take effect. In the future, hot-reload may be added for instant updates without refresh.
