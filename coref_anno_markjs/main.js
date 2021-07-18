var context = document.querySelector(".context");
var tbody = document.querySelector(".coref>table>tbody");
var colorPicker = document.querySelector("#color");
var checkBlock = document.querySelector('#check>pre');
var colorSelector = document.querySelector('.color-selector');
colorSelector.addEventListener('change', (e) => {
    colorPicker.value = e.target.value;
})

// Set default
colorPicker.value = rgbToHex(3, 161, 252); // default color
opacity = 0.35; // default opacity
colorSelector.innerHTML = `<option selected>Or Select a Previous Color</option>`
context.innerHTML = "Barack Obama nominated Hillary Rodham Clinton as his secretary	of state on Monday. He chose her because she had foreign affairs experience	as a former First Lady."
ACCU_SELECTED = 0;

// Set up Mark.js
var instance = new Mark(context);
var ranges = [];
instance.markRanges(ranges);

// Select text from article, then mark it
function getSelectedParagraphText() {
    if (window.getSelection) {
        selection = window.getSelection();
    } else if (document.selection) {
        selection = document.selection.createRange();
    }
    const range = selection.getRangeAt(0);
    if (!selection.isCollapsed && selection.toString().trim()){
        if (!context.contains(range.startContainer) 
            || !context.contains(range.endContainer)
        ) return false;

        // Reference: https://gist.github.com/maksimr/d67f303ce48c3f9de1960a33672954cc
        var position = range.startOffset;
        var currentNode = range.startContainer;
        while (currentNode !== context) {
            const parentNode = currentNode.parentNode;
            for (let i = 0; i < parentNode.childNodes.length; i++) {
                if (parentNode.childNodes[i] === currentNode) break;
                position += parentNode.childNodes[i].textContent.length;
            }
            currentNode = parentNode;
        }
        var text = selection.toString().trimEnd(); //.trimEnd() or .trimRight() or .rtrim()
        while (text.charAt(0) === ' ') {
            position += 1;
            text = text.trim();
        }
        return { 
            start: position, 
            length: text.length, 
            end: position+text.length-1,
            text: text
        }
    } else return false;
}

function deleteCoref_btn(id) {
    instance.unmark({"className": `mention-${id}`});
    // delete: ranges.length doesn't change / splice: ranges.length changes
    // delete ranges[ranges.findIndex(r => r !== undefined && r.id === id)];
    ranges.splice(ranges.findIndex(r => r.id === id), 1);
    tbody.innerHTML = ranges.map(r => cell(r)).join('');
    selectorUpdate();
}
function deleteCoref_click(id) {
    var delete_ = confirm(`Want to delete #id ${id}?`);
    if (delete_) deleteCoref_btn(id);
}

context.addEventListener('mouseup', () => {
    color = hexToRgb(colorPicker.value);
    selected_ = getSelectedParagraphText();
    if (selected_ && !checkRepeat(selected_)) {
        ranges.push({ id: ACCU_SELECTED+=1, color: colorPicker.value, ...selected_ });
        var options = {
            "className": `mention-${ACCU_SELECTED}`,
        };
        instance.markRanges([selected_], options);
        let elem = `<tr style="background-color: rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})">
            <th scopt="row">${ACCU_SELECTED}</th>
            <td>${selected_.start}</td>
            <td>${selected_.end}</td>
            <td>${selected_.text}</td>
            <td><button class="btn btn-danger" onclick="deleteCoref_btn(${ACCU_SELECTED})">&#10005;</button></td>
        </tr>`;
        tbody.innerHTML += elem;
        var node = document.querySelector(`.mention-${ACCU_SELECTED}`);
        node.style.backgroundColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
        node.setAttribute('onclick', `deleteCoref_click(${ACCU_SELECTED})`);

        selectorUpdate();
        colorSelector.value = colorPicker.value;
    }
});

// Show the annotation
function checkAnnotation() {
    // checkBlock.innerHTML = JSON.stringify(ranges, ["id", "start", "end", "text"], 4);
    let colors = [...new Set(ranges.map(r => r.color))].filter(c => typeof c === 'string');

    let annos = colors.map((c, index) => {
        let corefs_ = ranges.filter(r => r.color === c)
                            .map(r => ({ ...r, color: undefined }))
                            .sort((a, b) => (a.start > b.start) ? 1 : -1);
        return {
            mentionID: index,
            color: c,
            length: corefs_.length,
            corefs: corefs_
        }
    });
    checkBlock.innerHTML = JSON.stringify(annos, null, 4);

    ranges = colors.map(c => ranges.filter(r => r.color === c).sort((a, b) => a.start > b.start ? 1 : -1)).flat();
    tbody.innerHTML = ranges.map(r => cell(r)).join('')
}

// Helper Functions
function checkRepeat(selected) {
    if (selected) {
        return ranges.some(r => r.start === selected.start && r.length === selected.length);
    } else return false;
}

function selectorUpdate() {
    let current_color = colorSelector.value;
    let colors = [...new Set(ranges.map(r => r.color))].filter(c => typeof c === 'string');
    colorSelector.innerHTML = `<option selected>Or Select a Previous Color</option>`;
    colorSelector.innerHTML += colors.map(c => `<option value="${c}">${c}</option>`).join('');
    if (colors.includes(current_color)) colorSelector.value = current_color;
}

function cell(item) {
    let color = hexToRgb(item.color);
    return `
        <tr style="background-color: rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})">
            <th scopt="row">${item.id}</th>
            <td>${item.start}</td>
            <td>${item.end}</td>
            <td>${item.text}</td> 
            <td>
                <button 
                    class="btn btn-danger" 
                    onclick="deleteCoref_btn(${item.id})">&#10005;</button>
            </td>
        </tr>
    `
}

// Reference: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}