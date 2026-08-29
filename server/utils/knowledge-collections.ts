export const caeKnowledgeCategorySlugs = [
  'cae-algorithm-map',
  'structural-fem',
  'algebraic-solvers',
  'physics-discretization',
  'multiphysics-coupling',
  'optimization-uq-rom'
] as const

export type KnowledgeCollection = 'cfd' | 'openfoam' | 'modelica' | 'cae'

export function knowledgeCollectionFor(categorySlug: string): KnowledgeCollection {
  if (categorySlug.startsWith('openfoam-')) return 'openfoam'
  if (categorySlug === 'modelica' || categorySlug.startsWith('modelica-')) return 'modelica'
  if ((caeKnowledgeCategorySlugs as readonly string[]).includes(categorySlug)) return 'cae'
  return 'cfd'
}
