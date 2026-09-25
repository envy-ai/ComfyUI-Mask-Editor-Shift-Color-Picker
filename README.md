# Mask Editor Shift Color Picker

Adds Shift-click color picking to ComfyUI's default mask editor when the Paint Pen tool is selected. The cursor changes to an eyedropper while Shift is held. The sampled color includes the base image and any paint already on the paint layer. Shift-click does not start a brush stroke.

## Install

```bash
cd ComfyUI/custom_nodes
git clone https://github.com/envy-ai/ComfyUI-Mask-Editor-Shift-Color-Picker.git
```

Restart ComfyUI and refresh the browser. Open the default mask editor, select Paint Pen, then hold Shift and click a color in the image.

This is a frontend-only extension. It adds no workflow nodes and requires no other custom nodes or Python packages. Tested with ComfyUI frontend 1.53.6.
