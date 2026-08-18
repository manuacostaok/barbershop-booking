// 🔒 Sanitización anti NoSQL injection, compatible con Express 5.
//
// express-mongo-sanitize reasigna req.query completo, y en Express 5
// req.query es una propiedad de solo lectura (getter) -> rompe TODAS
// las requests con 500. Acá mutamos los objetos en el lugar en vez
// de reasignarlos.

const PROHIBITED = /^\$|\./;

function clean(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(clean);
    return obj;
  }

  if (obj && typeof obj === "object") {
    for (const key of Object.keys(obj)) {
      if (PROHIBITED.test(key)) {
        delete obj[key];
        continue;
      }
      clean(obj[key]);
    }
  }

  return obj;
}

module.exports = function sanitize(req, res, next) {
  if (req.body) clean(req.body);
  if (req.params) clean(req.params);
  if (req.query) clean(req.query); // mutación in-place, nunca reasignación

  next();
};
