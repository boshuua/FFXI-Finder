import { Request } from "express";
import { PageParser } from "../core/page-parser";
import * as character from "lodestone-css-selectors/profile/character.json";
import * as attributes from "lodestone-css-selectors/profile/attributes.json";
import * as gearset from "lodestone-css-selectors/profile/gearset.json";
import { CssSelectorRegistry, PAGE_REGION } from "../core/css-selector-registry";
import { parseHTML } from "linkedom";

const axios = require("axios").default;

export class Character extends PageParser {
  protected getURL(req: Request): string {
    return (
      "https://" + PAGE_REGION + ".finalfantasyxiv.com/lodestone/character/" +
      req.params.characterId
    );
  }

  protected getCSSSelectors(): CssSelectorRegistry {
    return { ...character, ...attributes, ...gearset };
  }

  public override async parse(req: Request, columnsPrefix = ''): Promise<Object> {
    const mainUrl = this.getURL(req);
    
    // Fetch the main profile page with default desktop headers so stats/race/etc parse properly
    const { data } = await axios.get(mainUrl).catch((err: any) => {
      throw new Error(err.response ? err.response.status : err.message);
    });

    const dom = parseHTML(data);
    const { document } = dom.window;

    // FFXIV gear slot index mapping
    const slotKeys = [
      "Mainhand",   // 0
      "Offhand",    // 1
      "Head",       // 2
      "Body",       // 3
      "Hands",      // 4
      "Waist",      // 5
      "Legs",       // 6
      "Feet",       // 7
      "Earrings",   // 8
      "Necklace",   // 9
      "Bracelets",  // 10
      "Ring1",      // 11
      "Ring2",      // 12
      "Soulcrystal" // 13
    ];
    const tooltipHtmlMap: { [key: string]: string } = {};
    const tooltipIconMap: { [key: string]: string } = {};

    // Find all gear elements that have data-lazy_load_url tooltips
    const tooltipElements = document.querySelectorAll(".js__db_tooltip");
    
    // Fetch all tooltips in parallel
    const promises = Array.from(tooltipElements).map(async (el: any) => {
      const path = el.getAttribute("data-lazy_load_url");
      if (path) {
        // Find which slot key it corresponds to by matching class name index (e.g. icon-c--0)
        let slotKey = "";
        for (let i = 0; i < slotKeys.length; i++) {
          if (el.className && el.className.includes(`icon-c--${i}`)) {
            slotKey = slotKeys[i];
            break;
          }
        }

        // Extract item icon src if it exists
        const imgEl = el.querySelector(".character__item_icon__img");
        const iconUrl = imgEl ? imgEl.getAttribute("src") : null;
        if (slotKey && iconUrl) {
          tooltipIconMap[slotKey] = iconUrl;
        }

        const tooltipUrl = `https://${PAGE_REGION}.finalfantasyxiv.com${path}`;
        try {
          const res = await axios.get(tooltipUrl);
          const tooltipDom = parseHTML(res.data);
          const tooltipDoc = tooltipDom.window.document;
          const tooltipContent = tooltipDoc.querySelector(".db-tooltip");
          if (tooltipContent) {
            // Safe inlining across different DOM documents for CSS selector resolution
            el.innerHTML += tooltipContent.outerHTML;

            // Save the raw HTML to return it to the frontend client
            if (slotKey) {
              tooltipHtmlMap[slotKey] = tooltipContent.outerHTML;
            }
          }
        } catch (e: any) {
          console.error(`Tooltip fetch/inline failed for ${path}:`, e.message);
        }
      }
    });

    await Promise.all(promises);

    // Call base parser using the inlined DOM
    const parsedResult = this.parseDocument(document, req, columnsPrefix) as any;

    // Inject raw tooltip HTML and icon URLs into the parsed gear slots
    for (const key of Object.keys(tooltipHtmlMap)) {
      if (parsedResult[key]) {
        parsedResult[key].Html = tooltipHtmlMap[key];
        parsedResult[key].Icon = tooltipIconMap[key] || null;
      }
    }

    return parsedResult;
  }
}
