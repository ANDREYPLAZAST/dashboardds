/**
 * Coordenadas para certificados DATE
 * 3 estudiantes por página:
 * - Posición 1 (arriba): Y desde abajo = 119
 * - Posición 2 (medio): Y desde abajo = 399
 * - Posición 3 (abajo): Y desde abajo = 714
 * 
 * Nombre: X: 266, Y: 119, 399, 714
 * CertificateNumber: X: 108, Y: 149, 427, 704
 * BirthDate: X: 400, Y: 110, 390, 705 (más abajo y a la derecha)
 * Fecha del curso (courseDate): X: 266, Y: 210, 490, 765 (más abajo y a la izquierda)
 */

export interface DateFieldCoordinates {
  [fieldKey: string]: { x: number; y: number };
}

export function getDatePositionCoordinates(
  position: 1 | 2 | 3
): DateFieldCoordinates {
  let baseY: number;
  let certificateNumberY: number;
  let birthDateY: number;
  let courseDateY: number;

  switch (position) {
    case 1:
      baseY = 119; // Top
      certificateNumberY = 149;
      birthDateY = 134; // Más abajo y a la derecha
      courseDateY = 210; // Más abajo y a la izquierda
      break;
    case 2:
      baseY = 399; // Middle
      certificateNumberY = 427;
      birthDateY = 415; // Más abajo y a la derecha
      courseDateY = 490; // Más abajo y a la izquierda
      break;
    case 3:
      baseY = 714; // Bottom
      certificateNumberY = 704;
      birthDateY = 687; // Más abajo y a la derecha
      courseDateY = 765; // Más abajo y a la izquierda
      break;
    default:
      baseY = 119;
      certificateNumberY = 149;
      birthDateY = 110;
      courseDateY = 210;
  }

  return {
    studentName: { x: 266, y: baseY },
    birthDate: { x: 297, y: birthDateY },
    certificateNumber: { x: 98, y: certificateNumberY },
    courseDate: { x: 266, y: courseDateY },
  };
}
