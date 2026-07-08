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

    // Find all gear elements that have data-lazy_load_url tooltips
    const tooltipElements = document.querySelectorAll(".js__db_tooltip");
    
    // Fetch all tooltips in parallel
    const promises = Array.from(tooltipElements).map(async (el: any) => {
      const path = el.getAttribute("data-lazy_load_url");
      if (path) {
        const tooltipUrl = `https://${PAGE_REGION}.finalfantasyxiv.com${path}`;
        try {
          const res = await axios.get(tooltipUrl);
          const tooltipDom = parseHTML(res.data);
          const tooltipDoc = tooltipDom.window.document;
          const tooltipContent = tooltipDoc.querySelector(".db-tooltip");
          if (tooltipContent) {
            // Safe inlining across different DOM documents
            el.innerHTML += tooltipContent.outerHTML;
          }
        } catch (e: any) {
          console.error(`Tooltip fetch/inline failed for ${path}:`, e.message);
        }
      }
    });

    await Promise.all(promises);

    // Call base parser using the inlined DOM
    return this.parseDocument(document, req, columnsPrefix);
  }
}
