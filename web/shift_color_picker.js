import { app } from "../../scripts/app.js";

const paintTool = '[data-testid="tool-button"][data-tool="rgbPaint"].maskEditor_toolPanelContainerSelected';
const pickerClass = "mask-editor-shift-color-picker";
const pickedPointers = new Set();

function sampleColor(root, event) {
    const canvases = root.querySelectorAll("#maskEditorCanvasContainer canvas");
    const image = canvases[0];
    const paint = canvases[1];
    const colorInput = root.querySelector('.maskEditor_sidePanel input[type="color"]');
    if (!image || !paint || !colorInput) return;

    const rect = image.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) * image.width / rect.width);
    const y = Math.floor((event.clientY - rect.top) * image.height / rect.height);
    if (x < 0 || y < 0 || x >= image.width || y >= image.height) return;

    const sample = document.createElement("canvas");
    sample.width = sample.height = 1;
    const context = sample.getContext("2d");
    if (!context) return;
    context.drawImage(image, x, y, 1, 1, 0, 0, 1, 1);
    context.drawImage(paint, x, y, 1, 1, 0, 0, 1, 1);
    const pixel = context.getImageData(0, 0, 1, 1).data;
    if (pixel[3] === 0) return;

    colorInput.value = `#${Array.from(pixel.slice(0, 3), value => value.toString(16).padStart(2, "0")).join("")}`;
    colorInput.dispatchEvent(new Event("input", { bubbles: true }));
}

function stopPointer(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
}

app.registerExtension({
    name: "mask_editor_shift_color_picker",
    setup() {
        const style = document.createElement("style");
        style.textContent = `
            .${pickerClass} [data-testid="mask-editor-root"]:has(${paintTool}) [data-testid="pointer-zone"] {
                cursor: url('/cursor/colorSelect.png') 15 25, crosshair !important;
            }
            .${pickerClass} [data-testid="mask-editor-root"]:has(${paintTool}) #maskEditor_brush {
                visibility: hidden !important;
            }
        `;
        document.head.append(style);

        window.addEventListener("keydown", event => {
            if (event.key === "Shift") document.documentElement.classList.add(pickerClass);
        });
        window.addEventListener("keyup", event => {
            if (event.key === "Shift") document.documentElement.classList.remove(pickerClass);
        });
        window.addEventListener("blur", () => {
            document.documentElement.classList.remove(pickerClass);
            pickedPointers.clear();
        });

        document.addEventListener("pointerdown", event => {
            if (!event.shiftKey || event.button !== 0 || event.pointerType !== "mouse") return;
            const zone = event.target.closest?.('[data-testid="pointer-zone"]');
            const root = zone?.closest('[data-testid="mask-editor-root"]');
            if (!root?.querySelector(paintTool)) return;

            pickedPointers.add(event.pointerId);
            stopPointer(event);
            sampleColor(root, event);
        }, true);

        document.addEventListener("pointermove", event => {
            document.documentElement.classList.toggle(pickerClass, event.shiftKey);
            if (pickedPointers.has(event.pointerId)) stopPointer(event);
        }, true);

        for (const type of ["pointerup", "pointercancel"]) {
            document.addEventListener(type, event => {
                if (!pickedPointers.delete(event.pointerId)) return;
                stopPointer(event);
            }, true);
        }
    },
});
