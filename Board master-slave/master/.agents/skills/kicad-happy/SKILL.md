---
name: kicad-happy
description: >-
  KiCad electronics design review and verification suite (kicad-happy).
  Analyzes schematics (.kicad_sch), PCB layouts (.kicad_pcb), Gerbers, EMC pre-compliance,
  SPICE simulations, BOM management, and datasheet verification. Use whenever the user mentions
  kicad-happy, KiCad, PCB review, schematic analysis, or hardware verification.
---

# KiCad-Happy: AI Electronics Design Assistant

kicad-happy provides a complete suite of tools to review, verify, and source KiCad projects.

## Included Skills

- **kicad**: Core schematic (`.kicad_sch`) and PCB (`.kicad_pcb`) parser, DRC/ERC, power trees, regulator feedback, decoupling.
- **emc**: 44 EMC pre-compliance rules across 18 categories.
- **spice**: SPICE simulation testbench generation and Monte Carlo verification.
- **datasheets**: Structured parameter extraction from PDF datasheets.
- **bom**: BOM extraction, MPN validation, multi-supplier pricing.
- **digikey**, **mouser**, **lcsc**, **element14**: Component sourcing and datasheet download.
- **jlcpcb**, **pcbway**: Fabrication and assembly readiness.

## Execution

- **Schematic Analysis**: `python .agents/skills/kicad/scripts/analyze_schematic.py <file>.kicad_sch --text`
- **PCB Layout Analysis**: `python .agents/skills/kicad/scripts/analyze_pcb.py <file>.kicad_pcb --text`
