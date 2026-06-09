import { generateC1, generateCi, generateCn, generateCni, generateCs } from './generateCn.js';
import { generateCnv } from './generateCnv.js';
import { generateCnh, generateSn } from './generateCnh.js';
import { generateDn, generateDnd, generateDnh } from './generateDn.js';
import { generateTetrahedral, generateThModel } from './generateTetrahedral.js';
import { generateOctahedral } from './generateCubic.js';

export function generateModel(pointGroup) {
  switch (pointGroup.model) {
    case 'genericAsymmetric':
      return generateC1();
    case 'inversionPair':
      return generateCi();
    case 'mirrorPair':
      return generateCs();
    case 'trigonalPyramid':
      return generateCnv(3);
    case 'Cn':
      return generateCn(pointGroup.n);
    case 'Cnv':
      return generateCnv(pointGroup.n);
    case 'Cnh':
      return generateCnh(pointGroup.n);
    case 'Cni':
      return generateCni(pointGroup.n);
    case 'Sn':
      return generateSn(pointGroup.n);
    case 'Dn':
      return generateDn(pointGroup.n);
    case 'Dnh':
      return generateDnh(pointGroup.n);
    case 'Dnd':
      return generateDnd(pointGroup.n);
    case 'tetrahedral':
      if (pointGroup.family === 'Th') return generateThModel();
      return generateTetrahedral();
    case 'octahedral':
      return generateOctahedral();
    default:
      return generateCn(pointGroup.n ?? 3);
  }
}
