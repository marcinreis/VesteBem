import * as adminService from '../services/admin.service.js'

export async function relatorioImpacto(req, res, next) {
  try {
    const relatorio = await adminService.gerarRelatorio()
    res.status(200).json(relatorio)
  } catch (err) {
    next(err)
  }
}
