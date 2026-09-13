import grammarJson from "../../content/generated/grammar-data.json"

export type GrammarExample = {
  jp: string
  cn: string
}

export type GrammarRecord = {
  title: string
  connection: string
  meaning: string
  note: string
  examples: GrammarExample[]
}

export const GRAMMAR_DATA: GrammarRecord[] = grammarJson as GrammarRecord[]
