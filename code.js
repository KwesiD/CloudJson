// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).
// This shows the HTML page in "ui.html".
figma.showUI(__html__);
function setImage(node, img) {
    let fills = node.fills;
    let newFills = [];
    for (let paint of fills) {
        if (paint.type === "IMAGE") {
            const newPaint = JSON.parse(JSON.stringify(paint));
            //Uint8Array.from(atob(params["stroke"].replace('data:image/svg+xml;base64,',"")), c => c.charCodeAt(0))
            newPaint.imageHash = figma.createImage(Uint8Array.from(img)).hash;
            newFills.push(newPaint);
        }
        node.fills = newFills;
    }
}
figma.ui.onmessage = msg => {
    const currFrame = figma.currentPage.children[0];
    console.log(currFrame);
    console.log(currFrame.width);
    if (msg.type === 'upload-file') {
        //console.log(msg.jsonFile);
        const params = msg.jsonFile;
        const nodes = figma.root.findAll(node => node.name.startsWith("%"));
        nodes.forEach(node => {
            let node_name = node.name.slice(1);
            if (node.type === "TEXT") {
                const font = node.fontName;
                figma.loadFontAsync(font).then(() => {
                    //console.log(node.name)
                    if (node_name === "greeting") {
                        let template = node.characters;
                        node.characters = template.replace("XX XX", params["customer_name"]);
                    }
                    else if (["poem_text", "poem_title", "context"].includes(node_name)) {
                        let initWidth = node.width;
                        let x = node.x;
                        let y = node.y;
                        let height = node.height;
                        node.textAutoResize = "WIDTH_AND_HEIGHT";
                        node.characters = params[node_name];
                        let currWidth = node.width;
                        let multiplier = Math.ceil(currWidth / initWidth) + 1;
                        console.log(initWidth);
                        console.log(height + " " + currWidth + " " + multiplier);
                        console.log(height);
                        let newHeight = height * multiplier;
                        console.log(newHeight);
                        node.resize(initWidth, newHeight);
                        node.textAutoResize = "NONE";
                        node.x = x;
                        node.y = y;
                    }
                    else if (node_name in params) {
                        node.characters = params[node_name];
                        //   if(["first_name","last_name"].includes(node_name)){
                        //       let offset = 0;
                        //       let x = (currFrame.width / 2 - node.width / 2);
                        //       const y = node.y + (.25 * node.height);
                        //       if (node.width > currFrame.width) {
                        //           offset = .10 * currFrame.width;
                        //           let ratio = (currFrame.width - (2 * offset)) / node.width;
                        //           node.fontSize = ratio * node.fontSize;
                        //           x = offset;
                        //       }
                        //       node.x = x;
                        //       node.y = y;
                        //   }
                    }
                });
            }
            if ( /*node.type === "RECTANGLE" && */node.name.includes("%stroke")) {
                let i = parseInt(node.name[node.name.length - 1]);
                let rectWidth = node.width;
                let rectHeight = node.height;
                let allCharacters = params["strokes"];
                let maxChars = 9; //max # of characters per row
                //console.log(allCharacters)
                let baseNode = node.clone();
                let prevRect = node;
                let baseX = baseNode.x;
                let baseY = baseNode.y;
                let yOffset = 0;
                //for (let i = 0; i < allCharacters.length; i++) {
                for (let j = 0; j < allCharacters[i].length; j++) {
                    //console.log(allCharacters[i])
                    //console.log(allCharacters[i].length)
                    let currChar = allCharacters[i][j].split(",");
                    //let nextChar = allCharacters[i][j + 1].split(",");
                    //console.log(currChar);
                    setImage(prevRect, currChar);
                    let newRect = prevRect.clone();
                    if (j % maxChars === 0 && j !== 0) {
                        newRect.x = baseX;
                        yOffset += rectHeight;
                        newRect.y = baseY + yOffset;
                    }
                    else {
                        newRect.x = prevRect.x + rectWidth;
                        newRect.y = baseY + yOffset;
                    }
                    //newRect.y = baseY + yOffset;
                    if (j !== allCharacters[i].length - 1) { //prevents the last character from being duplicated (i forgot why)
                        node.parent.appendChild(newRect);
                    }
                    else {
                        baseNode.remove();
                        newRect.remove();
                    }
                    prevRect = newRect;
                }
                // }
            }
        });
        //   let poem_title = figma.root.findOne(node => node.name == "%poem_title");
        //   let poem_text = figma.root.findOne(node => node.name == "%poem_text");
        //   let poem_context = figma.root.findOne(node => node.name == "%context");
        //   let multiplier = Math.ceil(poem_title.height/)
        //   console.log("Poem Title: " + poem_title.y + " " + poem_title.height);
        //   poem_text.y = poem_title.y + (2*poem_title.height) ;
        //   console.log("Poem Text: " + poem_text.y + " " + poem_text.height);
        //poem_context.y = poem_text.y + poem_text.height; 
        //console.log(poem_title);
        //console.log(nodes);
        // readFile('student.json', (err, data) => {
        //     if (err) throw err;
        //     let student = JSON.parse("data");
        //     console.log(student);
        // });
    }
    //figma.closePlugin();
};
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
// figma.ui.onmessage = msg => {
//   // One way of distinguishing between different types of messages sent from
//   // your HTML page is to use an object with a "type" property like this.
//   if (msg.type === 'create-rectangles') {
//     const nodes: SceneNode[] = [];
//     for (let i = 0; i < msg.count; i++) {
//       const rect = figma.createRectangle();
//       rect.x = i * 150;
//       rect.fills = [{type: 'SOLID', color: {r: 1, g: 0.5, b: 0}}];
//       figma.currentPage.appendChild(rect);
//       nodes.push(rect);
//     }
//     figma.currentPage.selection = nodes;
//     figma.viewport.scrollAndZoomIntoView(nodes);
//   }
//   // Make sure to close the plugin when you're done. Otherwise the plugin will
//   // keep running, which shows the cancel button at the bottom of the screen.
//   figma.closePlugin();
// };
