import axios from "axios";
import { parseHTML } from "linkedom";

async function run() {
  const url = "https://na.finalfantasyxiv.com/lodestone/character/?q=Ya+Oi&worldname=Phantom";
  try {
    const { data } = await axios.get(url);
    const dom = parseHTML(data);
    const document = dom.window.document;
    
    const entries = document.querySelectorAll("div.entry");
    console.log("Found div.entry count:", entries.length);

    // Let's print the entire outerHTML snippet of the container of the list
    const body = document.body;
    console.log("HTML length:", data.length);
    
    // Check if there is ".ldst__window"
    const windowEl = document.querySelector(".ldst__window");
    console.log("Found .ldst__window:", !!windowEl);
    if (windowEl) {
      console.log("Window El outerHTML snippet:", windowEl.outerHTML.slice(0, 1000));
    }

  } catch (e: any) {
    console.error("ERROR:", e.message);
  }
}

run();
