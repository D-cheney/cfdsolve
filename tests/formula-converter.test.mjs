import assert from 'node:assert/strict'
import { convertFormula, detectFormulaFormat } from '../utils/formula/converter.ts'

const encoding = convertFormula('Re = \u00cf\u0081UL/\u00ce\u00bc')
assert.equal(encoding.repaired, 'Re = ρUL/μ')
assert.match(encoding.latex, /\\rho\s+UL/)
assert.match(encoding.latex, /\\mu/)
assert.equal(encoding.diagnostics.some(item => item.level === 'error'), false)

const derivative = convertFormula('\u00e2\u02c6\u201au/\u00e2\u02c6\u201at + u\u00c2\u00b7\u00e2\u02c6\u2021u = -(1/\u00cf\u0081)\u00e2\u02c6\u2021p + \u00ce\u00bd\u00e2\u02c6\u2021\u00c2\u00b2u')
assert.match(derivative.repaired, /∂u\/∂t/)
assert.match(derivative.repaired, /u·∇/)
assert.match(derivative.latex, /\\frac\{\\partial u\}\{\\partial t\}/)
assert.match(derivative.latex, /\\nabla/)

const entities = convertFormula('Re = &rho;UL/&mu;, &nabla;&middot;u = 0')
assert.equal(entities.repaired, 'Re = ρUL/μ, ∇·u = 0')
assert.equal(entities.diagnostics.some(item => item.level === 'error'), false)

const unicode = convertFormula('Nu = hL/k = 0.023Re⁰·⁸Pr⁰·⁴')
assert.match(unicode.latex, /Re\^\{0\.8\}/)
assert.match(unicode.latex, /Pr\^\{0\.4\}/)

const latexSource = String.raw`\frac{d}{dx}(\rho u \phi)=\frac{d}{dx}\left(\Gamma\frac{d\phi}{dx}\right)`
const latex = convertFormula(latexSource)
assert.equal(latex.detectedFormat, 'latex')
assert.equal(latex.latex, latexSource)
assert.equal(latex.diagnostics.some(item => item.level === 'error'), false)

const lost = convertFormula('E = mc�')
assert.equal(lost.diagnostics.some(item => item.code === 'DATA_LOST'), true)

assert.equal(detectFormulaFormat('<math><mfrac><mi>a</mi><mi>b</mi></mfrac></math>'), 'mathml')
assert.equal(detectFormulaFormat(String.raw`\sqrt{x}`), 'latex')

const numericEntity = convertFormula('π = &#x3c0;')
assert.equal(numericEntity.repaired, 'π = π')

const invalidEntity = convertFormula('x = &#999999999;')
assert.match(invalidEntity.repaired, /&#999999999;/)
assert.equal(invalidEntity.diagnostics.some(item => item.code === 'ENTITY_RANGE'), true)

const surrogateEntity = convertFormula('x = &#55296;')
assert.match(surrogateEntity.repaired, /&#55296;/)
assert.equal(surrogateEntity.diagnostics.some(item => item.code === 'ENTITY_RANGE'), true)

console.log('formula converter: 10 scenarios passed')
