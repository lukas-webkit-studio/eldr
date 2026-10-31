# S7: zmenšení fotek v pásu recenzí (#36)

31. 10. 2026, úkol od K02. Webflow u obrázků z CMS na homepage neposílá `srcset`, a tak se posílaly originály. Fotky jsou teď zmenšené kopie: šířka 1000 px, poměr stran beze změny, bez ořezu, WebP kvalita 80 (PNG s průhledností zůstaly WebP s alfou).

- **Váha fotek v pásu na `/`, `/en`, `/de`:** 5,11 MB → **0,99 MB** (22 fotek, měřeno stažením ze stagingu). `/reference` po změně také 0,99 MB.
- **Vykreslená velikost:** karta 350 px na desktopu a 286 px na mobilu, takže 1000 px stačí i pro retinu (2×).
- **Vynechané fotky:** ROSSMANN, Kostel Krista Krále, ARTAMON, Sico Silicone a Apartmány Turista mají 1024–1066 px a 45–83 kB, zmenšení by nic neušetřilo. PUREM má 800 px a 23 kB.
- **Fotka je v CMS lokalizovaná.** Zápis do CS změní jen CS, proto se zapisovalo do CS, EN i DE. Webflow si při každém zápisu vytvoří vlastní kopii souboru, takže každý jazyk má jiné `fileId`, ale stejný obsah (md5 ověřeno na všech 48 variantách).
- **Originály ve Webflow Assets zůstávají.** Návrat: v `update_collection_items` dát do `obrazek` původní `url` ve všech třech jazycích.

## Mapování

| Firma | Původní soubor (CS i EN/DE) | Rozměr, velikost | Nový soubor (Assets) | Rozměr, velikost |
|---|---|---|---|---|
| Ahold Czech Republic | https://cdn.prod.website-files.com/637cd69d722176059a46c1fb/646437ab16050725c79d16b4_Albert%20Hypermarket%2018x3%20m%20Plzen%CC%8C%201-3.png | 1066×600 PNG, 746 kB | https://cdn.prod.website-files.com/635940ec249b210e8902edd4/6ae5cbaf7aba5765e2472d09_Albert-Hypermarket-Plzen-1000.webp | 1000×563 WebP, 43 kB |
| FIDES | https://cdn.prod.website-files.com/637cd69d722176059a46c1fb/6570da1b1f3146a61e1002f1_20230411_134448_HDR.webp | 2048×1536 WEBP, 47 kB | https://cdn.prod.website-files.com/635940ec249b210e8902edd4/6ae5cbaf5ffcb4a37415e656_20230411_134448_HDR-1000.webp | 1000×750 WebP, 20 kB |
| Farmet | https://cdn.prod.website-files.com/637cd69d722176059a46c1fb/6570da1ccb462be10b80ac57_20220602_114130_1.webp | 1300×732 WEBP, 100 kB | https://cdn.prod.website-files.com/635940ec249b210e8902edd4/6ae5cbb0ef2a4383af5c61e2_20220602_114130_1-1000.webp | 1000×563 WebP, 82 kB |
| JMB aircraft | https://cdn.prod.website-files.com/637cd69d722176059a46c1fb/6570da1ca7073f84c124a029_20230810_133839.webp | 4000×2252 WEBP, 223 kB | https://cdn.prod.website-files.com/635940ec249b210e8902edd4/6ae5cbafa5d3f837ad6ee178_20230810_133839-1000.webp | 1000×563 WebP, 40 kB |
| Konplan | https://cdn.prod.website-files.com/637cd69d722176059a46c1fb/6795ffe9b490aadf62e90de6_Group%20101305-1.png | 473×450 PNG, 325 kB | https://cdn.prod.website-files.com/635940ec249b210e8902edd4/6ae5cbb0538eb8282b214430_Group-101305-1-konplan-1000.webp | 473×450 WebP, 38 kB |
| LAMARK s.r.o. | https://cdn.prod.website-files.com/637cd69d722176059a46c1fb/67a9d671fb4a3a75dad8ea1d_centered_cropped_fj.jpg | 1324×882 JPEG, 199 kB | https://cdn.prod.website-files.com/635940ec249b210e8902edd4/6ae5cbaeda84eca6921c0213_centered_cropped_fj-1000.webp | 1000×666 WebP, 103 kB |
| Memvi s.r.o. | https://cdn.prod.website-files.com/637cd69d722176059a46c1fb/684017ed189b0b972faf80b9_IMG_20250522_164830k.jpg | 2392×1344 JPEG, 414 kB | https://cdn.prod.website-files.com/635940ec249b210e8902edd4/6ae5cb78ef2a4383af5c421d_IMG_20250522_164830k-1000.webp | 1000×562 WebP, 41 kB |
| Polytex s.r.o. | https://cdn.prod.website-files.com/637cd69d722176059a46c1fb/674da8660a5cc72567625e80_20240926_1441ss20_HDR.jpg | 1785×1004 JPEG, 291 kB | https://cdn.prod.website-files.com/635940ec249b210e8902edd4/6ae5cbaeda84eca6921c0225_20240926_1441ss20_HDR-1000.webp | 1000×562 WebP, 61 kB |
| ROBLON s.r.o. | https://cdn.prod.website-files.com/637cd69d722176059a46c1fb/67c05b60c1bdd4fece6236bd_improved_image.jpg | 2826×1762 JPEG, 395 kB | https://cdn.prod.website-files.com/635940ec249b210e8902edd4/6ae5cbaeda84eca6921c01fc_improved_image-1000.webp | 1000×623 WebP, 17 kB |
| SAGASSER | https://cdn.prod.website-files.com/637cd69d722176059a46c1fb/6463640fbdf192de9b07f282_SAGASSER%20HaS%CC%8Cfurt%2012-15%201%20(1).png | 1300×867 PNG, 1402 kB | https://cdn.prod.website-files.com/635940ec249b210e8902edd4/6ae5cbb0b410fb1323d98247_SAGASSER-Hassfurt-1000.webp | 1000×667 WebP, 66 kB |
| Schobeli Gruppe SE | https://cdn.prod.website-files.com/637cd69d722176059a46c1fb/69282ff7122a66752bf18527_Obr%C3%A1zek%20WhatsApp%2C%202025-11-04%20v%2012.33.45_2f6d3fda.jpg | 2048×1536 JPEG, 123 kB | https://cdn.prod.website-files.com/635940ec249b210e8902edd4/6ae5cbaedd587d8d7020a0c6_Obrazek-WhatsApp-2025-11-04-Schobeli-1000.webp | 1000×750 WebP, 13 kB |
| Studio REMA | https://cdn.prod.website-files.com/637cd69d722176059a46c1fb/68382eb7753883cc0bb75ad7_IMG-20230603-WA0000.jpg | 2048×1536 JPEG, 272 kB | https://cdn.prod.website-files.com/635940ec249b210e8902edd4/6ae5cbaea5d3f837ad6ee13f_IMG-20230603-WA0000-1000.webp | 1000×750 WebP, 30 kB |
| Studio dkLAB | https://cdn.prod.website-files.com/637cd69d722176059a46c1fb/683832a03fee3ce9f984661a_ChatGPT%20Image%2029.%205.%202025%2012_10_24.png | 1536×1024 PNG, 2088 kB | https://cdn.prod.website-files.com/635940ec249b210e8902edd4/6ae5cbaea3eb9f6217971775_dkLAB-vizualizace-1000.webp | 1000×667 WebP, 16 kB |
| Tamadex | https://cdn.prod.website-files.com/637cd69d722176059a46c1fb/6570da1f504d11db0c8fc3fb_20231012_145604.webp | 3198×1496 WEBP, 218 kB | https://cdn.prod.website-files.com/635940ec249b210e8902edd4/6ae5cbaf05e834b547f1dea1_20231012_145604-1000.webp | 1000×468 WebP, 40 kB |
| Tipsport | https://cdn.prod.website-files.com/637cd69d722176059a46c1fb/6795ff881bad5b4f53bb41cc_Group%20101305.png | 473×450 PNG, 306 kB | https://cdn.prod.website-files.com/635940ec249b210e8902edd4/6ae5cbaf7aba5765e2472cf7_Group-101305-tipsport-1000.webp | 473×450 WebP, 26 kB |
| UniCredit Bank | https://cdn.prod.website-files.com/637cd69d722176059a46c1fb/6795ffc00cf895f2f006fc30_Group%20101305-2.png | 480×450 PNG, 228 kB | https://cdn.prod.website-files.com/635940ec249b210e8902edd4/6ae5cbb1bbbd9f296dd8b3a3_Group-101305-2-unicredit-1000.webp | 480×450 WebP, 13 kB |

Schobeli EN měla před touto změnou vlastní kopii původní fotky (`6ae524c27ac5fc1e06831bfe`, viz rozhodnutí S7). Obsah je stejný jako u CS originálu.

## Soubory v CMS po zápisu (kopie, které Webflow vytvořilo)

| Firma | CS | EN | DE |
|---|---|---|---|
| Ahold Czech Republic | `6ae5cc5f1a88dda9a0af4cae` | `6ae5cc5f1a88dda9a0af4cae` | `6ae5cc5f1a88dda9a0af4cae` |
| FIDES | `6ae5cc5f1a88dda9a0af4cc0` | `6ae5cc5f1a88dda9a0af4cc0` | `6ae5cc5f1a88dda9a0af4cc0` |
| Farmet | `6ae5cc5f1a88dda9a0af4cc8` | `6ae5cc5f1a88dda9a0af4cc8` | `6ae5cc5f1a88dda9a0af4cc8` |
| JMB aircraft | `6ae5cc5f1a88dda9a0af4cb4` | `6ae5cc5f1a88dda9a0af4cb4` | `6ae5cc5f1a88dda9a0af4cb4` |
| Konplan | `6ae5cc5f1a88dda9a0af4cab` | `6ae5cc5f1a88dda9a0af4cab` | `6ae5cc5f1a88dda9a0af4cab` |
| LAMARK s.r.o. | `6ae5cc5f1a88dda9a0af4ca5` | `6ae5cc5f1a88dda9a0af4ca5` | `6ae5cc5f1a88dda9a0af4ca5` |
| Memvi s.r.o. | `6ae5cb975d4ac37746ad225c` | `6ae5cb975d4ac37746ad225c` | `6ae5cb975d4ac37746ad225c` |
| Polytex s.r.o. | `6ae5cc5f1a88dda9a0af4cba` | `6ae5cc5f1a88dda9a0af4cba` | `6ae5cc5f1a88dda9a0af4cba` |
| ROBLON s.r.o. | `6ae5cc5f1a88dda9a0af4cb7` | `6ae5cc5f1a88dda9a0af4cb7` | `6ae5cc5f1a88dda9a0af4cb7` |
| SAGASSER | `6ae5cc5f1a88dda9a0af4ca2` | `6ae5cc5f1a88dda9a0af4ca2` | `6ae5cc5f1a88dda9a0af4ca2` |
| Schobeli Gruppe SE | `6ae5cc5f1a88dda9a0af4cb1` | `6ae5cc5f1a88dda9a0af4cb1` | `6ae5cc5f1a88dda9a0af4cb1` |
| Studio REMA | `6ae5cc5f1a88dda9a0af4ca8` | `6ae5cc5f1a88dda9a0af4ca8` | `6ae5cc5f1a88dda9a0af4ca8` |
| Studio dkLAB | `6ae5cc5f1a88dda9a0af4c9f` | `6ae5cc5f1a88dda9a0af4c9f` | `6ae5cc5f1a88dda9a0af4c9f` |
| Tamadex | `6ae5cc5f1a88dda9a0af4cbd` | `6ae5cc5f1a88dda9a0af4cbd` | `6ae5cc5f1a88dda9a0af4cbd` |
| Tipsport | `6ae5cc5f1a88dda9a0af4ccb` | `6ae5cc5f1a88dda9a0af4ccb` | `6ae5cc5f1a88dda9a0af4ccb` |
| UniCredit Bank | `6ae5cc5f1a88dda9a0af4cc3` | `6ae5cc5f1a88dda9a0af4cc3` | `6ae5cc5f1a88dda9a0af4cc3` |
