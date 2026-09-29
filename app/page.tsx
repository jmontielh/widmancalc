'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Fuse from 'fuse.js'
import {
  Activity, ArrowRight, BookOpen, Calculator, Check, ChevronDown, Clock3,
  Droplets, Gauge, Info, Menu, Search, Settings2, ShieldCheck,
  SlidersHorizontal, Star, Thermometer, Wind, X, Zap, Plus, Trash2, Heart
} from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type Category = 'Todas' | 'Lubricación' | 'Conversión' | 'Rodamientos' | 'Hidráulica' | 'Aire' | 'Mantenimiento' | 'Ingeniería'
type CalcId = 'vi' | 'operational' | 'blend' | 'oilBath' | 'dripPoint' | 'api' | 'isoCst' | 'saybolt' | 'reducer' | 'bearing' | 'speedFactor' | 'greaseLife' | 'relube' | 'hydraulic' | 'pressureLoss' | 'oilTemp' | 'air' | 'airLube' | 'dewPoint' | 'converter' | 'lubeCost' | 'assetCriticality' | 'bearingLife' | 'chainSelection' | 'oilAnalysis' | 'greaseCoupling' | 'oilCorrection' | 'lubricationRoute'

type Calc = { id: CalcId; title: string; category: Exclude<Category, 'Todas'>; description: string; icon: typeof Droplets; accent: string; popular?: boolean; metric: string }

const categoryIcons: Record<Exclude<Category, 'Todas'>, typeof Droplets> = { Lubricación: Droplets, Conversión: SlidersHorizontal, Rodamientos: Activity, Hidráulica: Zap, Aire: Wind, Mantenimiento: Settings2, Ingeniería: ShieldCheck }

  const calculators: Calc[] = [
  { id: 'vi', title: 'Índice de viscosidad', category: 'Lubricación', description: 'Evalúa la estabilidad de un lubricante frente al cambio de temperatura.', icon: Thermometer, accent: 'amber', popular: true, metric: 'ASTM D2270' },
  { id: 'operational', title: 'Viscosidad operacional', category: 'Lubricación', description: 'Estima la viscosidad operacional con la curva completa entre 40 y 100 °C.', icon: Gauge, accent: 'teal', popular: true, metric: 'Estimación' },
  { id: 'blend', title: 'Mezcla de viscosidades', category: 'Lubricación', description: 'Calcula la viscosidad resultante de mezclar dos aceites.', icon: Droplets, accent: 'blue', metric: 'ISO VG' },
  { id: 'oilBath', title: 'Volumen de aceite en caja de engranajes', category: 'Lubricación', description: 'Estima el volumen de aceite para un cárter o baño de engranajes.', icon: Droplets, accent: 'teal', metric: 'Litros' },
  { id: 'dripPoint', title: 'Punto de goteo y temperatura', category: 'Lubricación', description: 'Verifica el margen de operación de una grasa frente a su punto de goteo.', icon: Thermometer, accent: 'amber', metric: '°C margen' },
  { id: 'api', title: 'Grados API y densidad', category: 'Conversión', description: 'Convierte entre grados API, densidad, gravedad específica, kilos por litro y libras por galón a 15.6 °C (60 °F).', icon: SlidersHorizontal, accent: 'orange', popular: true, metric: 'API 5B' },
  { id: 'isoCst', title: 'ISO VG a cSt', category: 'Conversión', description: 'Relaciona el grado ISO VG con su rango de viscosidad cinemática.', icon: Calculator, accent: 'blue', metric: 'ISO 3448' },
  { id: 'saybolt', title: 'Saybolt a cSt', category: 'Conversión', description: 'Convierte viscosidad Saybolt Universal a centistokes para selección de aceite.', icon: Calculator, accent: 'slate', metric: 'ASTM D2161' },
  { id: 'reducer', title: 'Viscosidad para reductores', category: 'Mantenimiento', description: 'Selecciona el grado ISO VG según lubricación, reducción, potencia y velocidad.', icon: Settings2, accent: 'purple', metric: 'ISO 3448' },
  { id: 'bearing', title: 'Carga de grasa en rodamientos', category: 'Rodamientos', description: 'Determina una cantidad inicial aproximada de grasa.', icon: Activity, accent: 'teal', popular: true, metric: 'SKF / FAG' },
  { id: 'speedFactor', title: 'Factor de velocidad DN', category: 'Rodamientos', description: 'Calcula el factor DN para evaluar el régimen de lubricación.', icon: Gauge, accent: 'blue', metric: 'mm·rpm' },
  { id: 'greaseLife', title: 'Vida estimada de grasa', category: 'Rodamientos', description: 'Estima horas de servicio considerando velocidad y temperatura.', icon: Clock3, accent: 'amber', metric: 'Horas' },
  { id: 'relube', title: 'Intervalo de relubricación', category: 'Mantenimiento', description: 'Calcula un intervalo base y ajusta por ambiente y vibración.', icon: Clock3, accent: 'amber', metric: 'Horas' },
  { id: 'lubricationRoute', title: 'Ruta de lubricación', category: 'Mantenimiento', description: 'Calcula tiempo total para planificar una ronda de lubricación.', icon: Activity, accent: 'coral', metric: 'Horas / ronda' },
  { id: 'hydraulic', title: 'Caudal y potencia hidráulica', category: 'Hidráulica', description: 'Relaciona caudal, presión y eficiencia del sistema.', icon: Zap, accent: 'blue', metric: 'kW / L·min' },
  { id: 'pressureLoss', title: 'Pérdida de carga', category: 'Hidráulica', description: 'Estima la pérdida de presión en una línea hidráulica.', icon: Gauge, accent: 'teal', metric: 'bar' },
  { id: 'oilTemp', title: 'Temperatura de aceite hidráulico', category: 'Hidráulica', description: 'Calcula aumento térmico aproximado por potencia perdida.', icon: Thermometer, accent: 'orange', metric: '°C' },
  { id: 'air', title: 'Aire de admisión', category: 'Aire', description: 'Calcula el CFM y L/min del motor para seleccionar el filtro de aire adecuado.', icon: Wind, accent: 'orange', metric: 'm³/min' },
  { id: 'airLube', title: 'Consumo de lubricador neumático', category: 'Aire', description: 'Estima gotas de aceite requeridas según consumo de aire.', icon: Droplets, accent: 'teal', metric: 'gotas/min' },
  { id: 'dewPoint', title: 'Punto de rocío y condensado', category: 'Aire', description: 'Evalúa el riesgo de condensación en redes de aire comprimido.', icon: Thermometer, accent: 'blue', metric: '°C' },
  { id: 'converter', title: 'Conversor de unidades', category: 'Conversión', description: 'Convierte viscosidad entre cSt, mm²/s, cP, mPa·s, Pa·s y SUS.', icon: Calculator, accent: 'slate', metric: 'Multiunidad' },
  { id: 'lubeCost', title: 'Costo anual de lubricación', category: 'Mantenimiento', description: 'Proyecta costo de producto y mano de obra por equipo.', icon: Calculator, accent: 'purple', metric: 'USD / año' },
  { id: 'assetCriticality', title: 'Criticidad del activo', category: 'Mantenimiento', description: 'Puntúa impacto, frecuencia y detectabilidad para priorizar rutas.', icon: ShieldCheck, accent: 'coral', metric: 'Prioridad' },
  { id: 'bearingLife', title: 'Vida L10 del rodamiento', category: 'Rodamientos', description: 'Estima la vida nominal y conecta carga, velocidad y viscosidad objetivo.', icon: Activity, accent: 'teal', popular: true, metric: 'ISO 281' },
  { id: 'chainSelection', title: 'Selección de cadena', category: 'Ingeniería', description: 'Estima potencia corregida y paso preliminar para transmisiones por cadena.', icon: Settings2, accent: 'blue', metric: 'DIN 8195' },
  { id: 'oilAnalysis', title: 'Interpretación de aceite', category: 'Ingeniería', description: 'Clasifica tendencias de viscosidad, contaminación y desgaste para una acción priorizada.', icon: ShieldCheck, accent: 'amber', popular: true, metric: 'Modelo configurable' },
  { id: 'greaseCoupling', title: 'Grasa para coples', category: 'Ingeniería', description: 'Propone consistencia y cantidad inicial según velocidad, temperatura y tamaño del cople.', icon: Droplets, accent: 'orange', metric: 'AGMA / OEM' },
  { id: 'oilCorrection', title: 'Corrección de viscosidad', category: 'Ingeniería', description: 'Convierte la viscosidad medida a temperatura de operación y propone un ISO VG objetivo.', icon: Thermometer, accent: 'purple', metric: 'ASTM D341' },
]

type CalcSpec = { basis: string; modelType: string; output: string; application: string; specNote: string }

const calcSpec: Record<CalcId, CalcSpec> = {
  vi: { basis: 'ASTM D2270', modelType: 'Cálculo normalizado', output: 'Índice de viscosidad (adimensional)', application: 'Estabilidad térmica de lubricantes', specNote: 'El índice de viscosidad se obtiene con el procedimiento normalizado ASTM D2270, que compara el aceite frente a fluidos de referencia para cuantificar su estabilidad térmica.' },
  operational: { basis: 'ASTM D341 (Walther)', modelType: 'Interpolación normalizada', output: 'Viscosidad cinemática (cSt)', application: 'Aceites a temperatura de operación', specNote: 'Interpolación según ASTM D341 (ecuación de Walther), el modelo normalizado que describe la relación viscosidad–temperatura de los aceites minerales.' },
  blend: { basis: 'ASTM D7152-23', modelType: 'Blending Method (doble logaritmo)', output: 'Viscosidad (cSt) / proporción (% v/v)', application: 'Formulación y mezcla de aceites', specNote: 'Método de mezcla ASTM D7152-23 (ASTM Blending Method) para viscosidades de los componentes conocidas a una misma temperatura. Usa la transformación doble logarítmica W = log10(log10(Z)); no es un promedio aritmético ni la fórmula simplificada de Refutas. Base de fracción: volumen (% v/v). D7152 también describe los métodos Wright, que requieren viscosidades a dos temperaturas.' },
  oilBath: { basis: 'Experiencia Widman', modelType: 'Estimación geométrica', output: 'Volumen de aceite (L)', application: 'Cárteres y cajas de engranajes', specNote: 'Estimación geométrica basada en la experiencia de Widman para dimensionar el volumen de carga de cárteres y cajas de engranajes.' },
  dripPoint: { basis: 'ASTM D566 / D2265', modelType: 'Margen térmico', output: 'Margen al punto de goteo (°C)', application: 'Grasas lubricantes', specNote: 'Margen térmico sobre el punto de goteo ASTM D566 / D2265, que indica la temperatura a la que la grasa pierde su estructura.' },
  api: { basis: 'API MPMS 11.1 / ASTM D1250', modelType: 'Conversión normalizada', output: 'Grados API y densidad a 15.6 °C', application: 'Caracterización de fluidos', specNote: 'Conversión normalizada API MPMS 11.1 / ASTM D1250 entre densidad y grados API referidos a 15.6 °C.' },
  isoCst: { basis: 'ISO 3448', modelType: 'Conversión normalizada', output: 'Viscosidad cinemática (cSt)', application: 'Clasificación de aceites industriales', specNote: 'Clasificación ISO 3448 que asocia cada grado ISO VG a su viscosidad cinemática nominal a 40 °C.' },
  saybolt: { basis: 'ASTM D2161', modelType: 'Conversión normalizada', output: 'Viscosidad cinemática (cSt)', application: 'Selección de aceite', specNote: 'Conversión normalizada ASTM D2161 entre segundos universales Saybolt y viscosidad cinemática.' },
  reducer: { basis: 'ISO 12925-1 / AGMA 9005-F16', modelType: 'Modelo empírico', output: 'Grado ISO VG', application: 'Reductores y engranajes', specNote: 'Modelo empírico ISO 12925-1 / AGMA 9005-F16 para seleccionar el grado ISO VG según carga, velocidad y tipo de lubricación.' },
  bearing: { basis: 'SKF / FAG', modelType: 'Estimación geométrica', output: 'Carga inicial de grasa (g)', application: 'Rodamientos', specNote: 'Estimación geométrica del volumen inicial de grasa según la práctica SKF / FAG para rodamientos.' },
  speedFactor: { basis: 'ISO 15312', modelType: 'Cálculo directo', output: 'Factor DN (×10³ mm·rpm)', application: 'Régimen de lubricación de rodamientos', specNote: 'Cálculo directo del factor DN (ISO 15312) que caracteriza el régimen de velocidad del rodamiento.' },
  greaseLife: { basis: 'SKF / DIN 51825', modelType: 'Modelo empírico', output: 'Vida de servicio (horas)', application: 'Rodamientos', specNote: 'Modelo empírico SKF / DIN 51825 que relaciona velocidad, temperatura y carga con la vida útil de la grasa.' },
  relube: { basis: 'SKF / ISO 15257', modelType: 'Modelo empírico', output: 'Intervalo de relubricación (horas)', application: 'Rodamientos', specNote: 'Modelo empírico SKF / ISO 15257 para estimar el intervalo de relubricación a partir de las condiciones de servicio.' },
  lubricationRoute: { basis: 'Experiencia Widman', modelType: 'Modelo de planificación', output: 'Tiempo por ronda (horas)', application: 'Gestión de mantenimiento', specNote: 'Modelo de planificación basado en la experiencia de Widman para dimensionar el tiempo de las rondas de lubricación.' },
  hydraulic: { basis: 'ISO 4413', modelType: 'Modelo físico', output: 'Potencia hidráulica (kW)', application: 'Sistemas hidráulicos', specNote: 'Modelo físico conforme a ISO 4413 que deriva la potencia hidráulica del caudal, la presión y la eficiencia.' },
  pressureLoss: { basis: 'Darcy–Weisbach (ISO 4413)', modelType: 'Modelo físico', output: 'Pérdida de carga (bar)', application: 'Líneas hidráulicas', specNote: 'Ecuación de Darcy–Weisbach (ISO 4413) para la pérdida de carga por fricción en la línea hidráulica.' },
  oilTemp: { basis: 'Experiencia Widman', modelType: 'Balance térmico', output: 'Temperatura del aceite (°C)', application: 'Sistemas hidráulicos', specNote: 'Balance térmico basado en la experiencia de Widman entre el calor disipado y la capacidad del sistema.' },
  air: { basis: 'SAE J1349', modelType: 'Modelo físico', output: 'Flujo de aire (CFM)', application: 'Motores y filtros de aire', specNote: 'Modelo físico SAE J1349 para el flujo de aire de admisión según cilindrada y régimen del motor.' },
  airLube: { basis: 'Experiencia Widman', modelType: 'Dosificación proporcional', output: 'Dosis (gotas/min)', application: 'Herramientas y actuadores neumáticos', specNote: 'Dosificación proporcional según la experiencia de Widman entre el caudal de aire y el lubricante requerido.' },
  dewPoint: { basis: 'ISO 8573-1 (Magnus)', modelType: 'Modelo físico', output: 'Margen al punto de rocío (°C)', application: 'Redes de aire comprimido', specNote: 'Modelo físico ISO 8573-1 con la ecuación de Magnus para el margen al punto de rocío del aire comprimido.' },
  converter: { basis: 'ASTM D2161 / ISO 3104', modelType: 'Conversión normalizada', output: 'Viscosidad multiunidad', application: 'Conversión de datos de viscosidad', specNote: 'Conversión normalizada ASTM D2161 / ISO 3104 entre unidades de viscosidad dinámica y cinemática.' },
  lubeCost: { basis: 'Experiencia Widman', modelType: 'Modelo presupuestario', output: 'Costo anual (USD/año)', application: 'Gestión de lubricación', specNote: 'Modelo presupuestario basado en la experiencia de Widman que suma producto, mano de obra y disposición del lubricante.' },
  assetCriticality: { basis: 'FMEA (IEC 60812)', modelType: 'Índice configurable', output: 'Índice de prioridad', application: 'Priorización de activos', specNote: 'Índice configurable tipo FMEA (IEC 60812) que combina impacto, frecuencia y detectabilidad para priorizar activos.' },
  bearingLife: { basis: 'ISO 281', modelType: 'Cálculo normalizado', output: 'Vida nominal L10 (horas)', application: 'Rodamientos', specNote: 'Cálculo normalizado ISO 281 de la vida nominal L10 a partir de la carga dinámica y la carga equivalente.' },
  chainSelection: { basis: 'DIN 8195', modelType: 'Modelo empírico', output: 'Potencia corregida / paso', application: 'Transmisiones por cadena', specNote: 'Modelo empírico DIN 8195 para la potencia corregida y el paso preliminar de la transmisión por cadena.' },
  oilAnalysis: { basis: 'ASTM D7720 / límites OEM', modelType: 'Índice configurable', output: 'Nivel de alerta', application: 'Análisis de aceite en servicio', specNote: 'Índice configurable según ASTM D7720 y límites OEM para clasificar tendencias de viscosidad, contaminación y desgaste.' },
  greaseCoupling: { basis: 'AGMA 9001 / OEM', modelType: 'Estimación geométrica', output: 'Consistencia y cantidad (g)', application: 'Coples de engranaje', specNote: 'Estimación geométrica AGMA 9001 / OEM para la consistencia y la carga inicial de grasa del cople.' },
  oilCorrection: { basis: 'ASTM D341 / ISO 3448', modelType: 'Interpolación normalizada', output: 'Viscosidad (cSt) e ISO VG objetivo', application: 'Selección de lubricante', specNote: 'Interpolación ASTM D341 / ISO 3448 para corregir la viscosidad a la temperatura de operación y proponer un ISO VG objetivo.' },
}

const defaults: Record<CalcId, Record<string, string>> = {
  vi: { v40: '112', v100: '15.2' }, operational: { viscosity40: '68', viscosity100: '8.6', operating: '60' }, blend: { oilA: '220', oilB: '46', ratio: '60', target: '100', temperature: '40', batch: '' }, oilBath: { length: '80', width: '60', height: '35', fill: '70' }, dripPoint: { drip: '190', operating: '145', safety: '15' }, api: { value: '30', unit: 'api' }, isoCst: { iso: '220' }, saybolt: { sus: '120' }, reducer: { lubrication: 'splash', reduction: 'simple', hp: '25', rpm: '1450' }, bearing: { od: '90', id: '45', width: '23', fill: '30' }, speedFactor: { dm: '67.5', rpm: '1800' }, greaseLife: { speed: '1800', temp: '70', load: '1' }, relube: { speed: '1800', dm: '67.5', temp: '65', vibration: '1.2', humidity: '45' }, lubricationRoute: { points: '24', minutes: '8', frequency: '12' }, hydraulic: { flow: '42', pressure: '160', efficiency: '85' }, pressureLoss: { flow: '42', diameter: '25', length: '18', viscosity: '46' }, oilTemp: { power: '8', ambient: '28', tank: '120', flow: '42' }, air: { displacement: '2400', displacementUnit: 'cc', rpm: '4000', engineType: 'gasolineElectronic' }, airLube: { flow: '850', ratio: '1' }, dewPoint: { air: '7', ambient: '24', pressure: '7' }, converter: { value: '100', from: 'cSt', to: 'cP', density: '0.86' }, lubeCost: { tankCapacity: '60', changesPerYear: '3', refillPerMonth: '5', oilPrice: '8.5', filterCost: '25', hoursPerChange: '1.5', laborRate: '15', disposalRate: '0.5', labCost: '120' }, assetCriticality: { impact: '4', frequency: '3', detection: '2' }, bearingLife: { dynamicLoad: '35', equivalentLoad: '8', rpm: '1800', reliability: '90', viscosityRatio: '1.2' }, chainSelection: { power: '15', rpm: '1750', drivenRpm: '350', serviceFactor: '1.3', centerDistance: '600' }, oilAnalysis: { viscosityChange: '8', water: '0.03', iron: '12', silicon: '8', hours: '500' }, greaseCoupling: { shaftDiameter: '80', couplingDiameter: '180', rpm: '1450', temperature: '70', factor: '1' }, oilCorrection: { measuredViscosity: '68', measuredTemp: '40', operatingTemp: '80', viscosityIndex: '95', density: '0.86' },
}

// --- Modelo de mezcla ASTM D7152-23 (ASTM Blending Method, una sola temperatura) ---
// Transformación doble logarítmica del estándar ASTM D341/D7152. nu en cSt (mm^2/s).
// Z = nu + 0.7 + término de corrección; W = log10(log10(Z)). No es promedio aritmético.
function transformViscosity(nu: number) {
  const Z = nu + 0.7 + Math.exp(-1.47 - 1.84 * nu - 0.51 * nu * nu)
  return Math.log10(Math.log10(Z)) // W
}
// Transformación inversa: recupera la viscosidad cinemática (cSt) a partir de W.
function inverseTransform(W: number) {
  const logZ = Math.pow(10, W)        // log10(Z)
  const w = Math.pow(10, logZ) - 0.7  // Z - 0.7
  return w - Math.exp(-0.7487 - 3.295 * w + 0.6119 * w * w - 0.3193 * w * w * w)
}
// Viscosidad de la mezcla dadas dos viscosidades y la fracción (0-1) del aceite 1.
function calculateBlendViscosity(nu1: number, nu2: number, fraction1: number) {
  const f1 = fraction1
  const f2 = 1 - f1
  return inverseTransform(f1 * transformViscosity(nu1) + f2 * transformViscosity(nu2))
}
// Fracción del aceite 1 para alcanzar una viscosidad objetivo. Devuelve null si no hay solución única.
function calculateBlendFractions(nu1: number, nu2: number, target: number) {
  const W1 = transformViscosity(nu1)
  const W2 = transformViscosity(nu2)
  if (Math.abs(W1 - W2) < 1e-12) return null
  return (transformViscosity(target) - W2) / (W1 - W2)
}

function calculate(id: CalcId, values: Record<string, string>) {
  const n = (key: string) => Number(values[key]) || 0
  switch (id) {
    case 'vi': { const u = n('v40'); const y = n('v100'); const invalid = !Number.isFinite(u) || !Number.isFinite(y) || u <= 0 || y <= 0 || u <= y; if (invalid) return { value: 0, unit: 'VI', label: 'Datos no válidos para calcular', note: 'La viscosidad a 40 °C debe ser positiva y mayor que la viscosidad a 100 °C. Revise los valores ingresados.' }; const bands = [{ max: 3.8, a: 1.14673, b: 1.7576, c: -0.109, d: 0.84155, e: 1.5521, f: -0.077 }, { max: 4.4, a: 3.38095, b: -15.4952, c: 33.196, d: 0.78571, e: 1.7929, f: -0.183 }, { max: 5, a: 2.5, b: -7.2143, c: 13.812, d: 0.82143, e: 1.5679, f: 0.119 }, { max: 6.4, a: 0.101001, b: 16.635, c: -45.469, d: 0.049859, e: 9.1613, f: -18.557 }, { max: 7, a: 3.35714, b: -23.564, c: 378.466, d: 0.22619, e: 7.7369, f: -16.656 }, { max: 7.7, a: 0.011912, b: 1.475, c: -72.87, d: 0.79762, e: -0.7321, f: 14.61 }, { max: 9, a: 0.41858, b: 16.1558, c: -56.04, d: 0.05794, e: 10.5156, f: -28.24 }, { max: 12, a: 0.88797, b: 7.5527, c: -16.6, d: 0.26665, e: 6.7015, f: -10.81 }, { max: 15, a: 0.7672, b: 10.7972, c: -38.18, d: 0.20073, e: 8.4658, f: -22.49 }, { max: 18, a: 0.97305, b: 5.3135, c: -2.2, d: 0.28889, e: 5.9741, f: -4.93 }, { max: 22, a: 0.97256, b: 5.25, c: -0.98, d: 0.24504, e: 7.416, f: -16.73 }, { max: 28, a: 0.91413, b: 7.4759, c: -21.82, d: 0.20323, e: 9.1267, f: -34.23 }, { max: 40, a: 0.8703, b: 19.7157, c: -50.77, d: 0.18411, e: 10.1015, f: -46.75 }, { max: 55, a: 0.84703, b: 12.6752, c: -133.31, d: 0.17029, e: 11.4866, f: -80.62 }, { max: 70, a: 0.85921, b: 11.1009, c: -83.19, d: 0.1713, e: 11.368, f: -76.94 }, { max: Infinity, a: 0.8353, b: 14.673, c: -216, d: 0.1684, e: 11.8493, f: -96.947 }]; const band = bands.find((item) => y <= item.max); if (!band || y < 2) return { value: 0, unit: 'VI', label: 'Fuera del rango ASTM D2270', note: 'La norma no define el índice para viscosidades menores de 2 cSt a 100 °C.' }; const l = band.a * y ** 2 + band.b * y + band.c; const h = band.d * y ** 2 + band.e * y + band.f; if (!Number.isFinite(l) || !Number.isFinite(h) || l <= h) return { value: 0, unit: 'VI', label: 'Datos no válidos para calcular', note: 'No fue posible obtener referencias ASTM válidas para estos datos.' }; const vi = u <= h ? 100 + (Math.pow(10, Math.log10(h / u) / Math.log10(y)) - 1) / 0.00715 : 100 * (l - u) / (l - h); if (!Number.isFinite(vi)) return { value: 0, unit: 'VI', label: 'Datos no válidos para calcular', note: 'Revise las viscosidades ingresadas.' }; const boundedVi = Math.max(-100, Math.min(500, vi)); return { value: Math.round(boundedVi), unit: 'VI', label: 'Índice de viscosidad estimado', note: `ASTM D2270, Apéndice X2: U=${u.toFixed(2)} cSt a 40 °C, Y=${y.toFixed(2)} cSt a 100 °C; L=${l.toFixed(2)} y H=${h.toFixed(2)} cSt. Se aplicó la ecuación cuadrática continua del intervalo correspondiente y redondeo al entero más cercano.` } }
    case 'operational': { const v40 = Math.max(n('viscosity40'), 0.01); const v100 = Math.max(n('viscosity100'), 0.01); const target = n('operating'); const x1 = Math.log10(273 + 40); const x2 = Math.log10(273 + 100); const y1 = Math.log10(Math.log10(v40 + 0.7)); const y2 = Math.log10(Math.log10(v100 + 0.7)); const b = (y1 - y2) / (x2 - x1); const a = (b * x1) + y1; const yTarget = a - (b * Math.log10(273 + target)); const result = Math.max(0, Math.pow(10, Math.pow(10, yTarget)) - 0.7); return { value: Math.round(result * 100) / 100, unit: 'cSt', label: 'Viscosidad a temperatura de operación', note: 'Modelo ASTM D341 / Walther con viscosidades medidas a 40 °C y 100 °C. Para temperaturas fuera de ese rango, confirme con la curva del fabricante.' } }
    case 'blend': {
      const nu1 = Number(values.oilA)
      const nu2 = Number(values.oilB)
      const temp = values.temperature || '40'
      const isTarget = values.mode === 'target'
      const errUnit = isTarget ? '% aceite 1' : 'cSt'
      const disclaimer = 'Resultado estimado por cálculo; para producción o especificación final, confirme mediante mezcla física y ensayo de viscosidad. Mezclar viscosidades no certifica compatibilidad química ni equivalencia de prestaciones.'
      // Solo viscosidades numéricas estrictamente mayores que cero.
      if (!Number.isFinite(nu1) || !Number.isFinite(nu2) || nu1 <= 0 || nu2 <= 0) {
        return { value: 0, unit: errUnit, label: 'Datos no válidos para calcular', note: 'Ingrese viscosidades numéricas estrictamente mayores que cero para ambos aceites, medidas a la misma temperatura.' }
      }
      const W1 = transformViscosity(nu1)
      const W2 = transformViscosity(nu2)
      if (!Number.isFinite(W1) || !Number.isFinite(W2)) {
        return { value: 0, unit: errUnit, label: 'Fuera del rango del modelo', note: 'El método ASTM D7152 requiere viscosidades dentro de un rango físico válido (habitualmente ≥ 2 cSt). Revise los valores ingresados.' }
      }
      if (isTarget) {
        const target = Number(values.target)
        if (!Number.isFinite(target) || target <= 0) {
          return { value: 0, unit: '% aceite 1', label: 'Datos no válidos para calcular', note: 'Ingrese una viscosidad objetivo numérica estrictamente mayor que cero.' }
        }
        const Wt = transformViscosity(target)
        if (!Number.isFinite(Wt)) {
          return { value: 0, unit: '% aceite 1', label: 'Fuera del rango del modelo', note: 'La viscosidad objetivo queda fuera del rango físico admitido por el método ASTM D7152.' }
        }
        // Viscosidades de ambos aceites iguales: sin solución única.
        if (Math.abs(W1 - W2) < 1e-12) {
          if (Math.abs(Wt - W1) < 1e-9) return { value: 0, unit: '% aceite 1', label: 'Sin solución única', note: `Ambos aceites tienen la misma viscosidad (${nu1} cSt) y coinciden con el objetivo: cualquier proporción produce el mismo resultado según el modelo ASTM D7152. No existe una receta única.` }
          return { value: 0, unit: '% aceite 1', label: 'Objetivo no alcanzable', note: `Ambos aceites tienen la misma viscosidad (${nu1} cSt); no es posible alcanzar ${target} cSt combinándolos.` }
        }
        let f1 = (Wt - W2) / (W1 - W2)
        // Tolerancia de punto flotante: redondear a 0 o 1 solo si está a menos de 1e-10.
        if (f1 < 0 && f1 > -1e-10) f1 = 0
        if (f1 > 1 && f1 < 1 + 1e-10) f1 = 1
        if (f1 < 0 || f1 > 1) {
          const lo = Math.min(nu1, nu2); const hi = Math.max(nu1, nu2)
          return { value: 0, unit: '% aceite 1', label: 'Objetivo no alcanzable', note: `Con proporciones físicas (0–100%) la mezcla solo puede quedar entre ${lo} y ${hi} cSt. El objetivo de ${target} cSt queda fuera de ese intervalo; no se muestran porcentajes negativos ni superiores a 100%.` }
        }
        const f2 = 1 - f1
        return {
          value: Math.round(100 * f1 * 100) / 100,
          unit: '% aceite 1',
          label: 'Porcentaje requerido del aceite 1 (base volumen v/v)',
          note: `Aceite 2: ${(100 * f2).toFixed(2)} %. Viscosidades a ${temp} °C. Ver cálculo (ASTM D7152-23): W₁=${W1.toFixed(4)}, W₂=${W2.toFixed(4)}, W_objetivo=${Wt.toFixed(4)}, f₁=${f1.toFixed(4)}, f₂=${f2.toFixed(4)}. ${disclaimer}`
        }
      }
      // Modo viscosidad final: fracción del aceite 1 en 0-100 %.
      const pct1 = Number(values.ratio)
      if (!Number.isFinite(pct1) || pct1 < 0 || pct1 > 100) {
        return { value: 0, unit: 'cSt', label: 'Datos no válidos para calcular', note: 'El porcentaje del aceite 1 debe ser un número entre 0 y 100 %.' }
      }
      const f1 = pct1 / 100
      const f2 = 1 - f1
      const Wmix = f1 * W1 + f2 * W2
      const nuMix = inverseTransform(Wmix)
      if (!Number.isFinite(nuMix) || nuMix <= 0) {
        return { value: 0, unit: 'cSt', label: 'No fue posible calcular', note: 'La combinación de valores produjo un resultado no válido. Revise las viscosidades ingresadas.' }
      }
      return {
        value: Math.round(nuMix * 100) / 100,
        unit: 'cSt',
        label: 'Viscosidad cinemática estimada de la mezcla (base volumen v/v)',
        note: `Aceite 1: ${(100 * f1).toFixed(2)} % · Aceite 2: ${(100 * f2).toFixed(2)} %. Viscosidades a ${temp} °C. Ver cálculo (ASTM D7152-23): W₁=${W1.toFixed(4)}, W₂=${W2.toFixed(4)}, W_mezcla=${Wmix.toFixed(4)}. ${disclaimer}`
      }
    }
    case 'oilBath': { const lengthM = n('length') / 100; const widthM = n('width') / 100; const heightM = n('height') / 100; const fill = Math.min(Math.max(n('fill'), 0), 100); return { value: Math.round(lengthM * widthM * heightM * fill * 10) / 10, unit: 'L', label: 'Volumen recomendado de aceite', note: 'Dimensiones ingresadas en centímetros y convertidas internamente a metros. Considere nivel, expansión térmica y espacio libre del cárter.' } }
    case 'dripPoint': return { value: Math.round(n('drip') - n('operating') - n('safety')), unit: '°C', label: 'Margen térmico disponible', note: 'Mantenga un margen suficiente bajo el punto de goteo indicado por el fabricante.' }
    case 'api': { const input = n('value'); const inputUnit = values.unit || 'api'; const sg = inputUnit === 'api' ? 141.5 / Math.max(input + 131.5, 0.001) : inputUnit === 'lbgal' ? input / 8.345404 : input; const api = 141.5 / Math.max(sg, 0.001) - 131.5; const kgL = sg; const lbgal = sg * 8.345404; return { value: Math.round(api * 100) / 100, unit: '°API', label: 'Conversión a 15.6 °C (60 °F)', note: `Densidad: ${kgL.toFixed(4)} kg/L · Gravedad específica: ${sg.toFixed(4)} · Libras por galón: ${lbgal.toFixed(3)} lb/gal. ${api > 10 ? 'El producto es más liviano que el agua y tenderá a flotar.' : 'El producto es más pesado que el agua y tenderá a asentarse.'} Todos los valores se refieren a 60 °F (15.6 °C).` } }
    case 'isoCst': return { value: Math.round(n('iso') * 0.9 * 10) / 10, unit: 'cSt', label: 'Viscosidad cinemática aproximada', note: 'El grado ISO VG representa un punto nominal con tolerancia de fabricación.' }
    case 'saybolt': return { value: Math.round((n('sus') * 0.22 - 135 / Math.max(n('sus'), 1)) * 10) / 10, unit: 'cSt', label: 'Viscosidad cinemática', note: 'Conversión aproximada para Saybolt Universal sobre el rango habitual.' }
    case 'reducer': { const hp = Math.max(n('hp'), 0); const rpm = Math.max(n('rpm'), 1); const loadIndex = hp / rpm * 1000 * (values.reduction === 'multiple' ? 1.35 : 1); const speedAdjustment = rpm < 750 ? 1 : rpm > 1800 ? -1 : 0; const circulationAdjustment = values.lubrication === 'circulation' ? -1 : 0; const thresholds = [0, 5, 10, 20, 35, 60]; const index = Math.min(6, Math.max(0, thresholds.filter((threshold) => loadIndex + speedAdjustment + circulationAdjustment >= threshold).length - 1)); const grades = [68, 100, 150, 220, 320, 460, 680]; const grade = grades[index]; return { value: grade, unit: 'ISO VG', label: 'Grado recomendado', note: `Criterio: ${values.lubrication === 'circulation' ? 'recirculación por bomba' : 'baño por salpicadura'} · ${values.reduction === 'multiple' ? 'reducción múltiple (>10:1)' : 'reducción simple (<10:1)'}. Modelo preliminar basado en potencia específica y velocidad; valide con fabricante y temperatura real del cárter.` } }
    case 'bearing': return { value: Math.round((n('od') - n('id')) * n('width') * (n('fill') / 100) * 0.005 * 10) / 10, unit: 'g', label: 'Carga inicial aproximada', note: 'No llenar completamente: deje espacio para expansión y purga.' }
    case 'speedFactor': return { value: Math.round((n('dm') * n('rpm')) / 1000), unit: '×10³ mm·rpm', label: 'Factor de velocidad DN', note: 'Compare el factor con los límites de la grasa y el rodamiento seleccionado.' }
    case 'greaseLife': return { value: Math.round(18000 / Math.max(n('speed') / 1000, 0.1) * Math.max(0.3, 1 - n('temp') / 300) * Math.max(0.3, 1 - n('load') / 10)), unit: 'h', label: 'Vida estimada de grasa', note: 'Estimación base: confirme con catálogo del fabricante y condición real.' }
    case 'relube': return { value: Math.round(15000000 / Math.max(n('speed') * n('dm'), 1) * (1 - n('temp') / 500) * (1 - n('humidity') / 1000) * 10) / 10, unit: 'h', label: 'Intervalo base recomendado', note: 'Reduzca el intervalo si hay agua, polvo, vibración o choques.' }
    case 'hydraulic': return { value: Math.round(n('flow') * n('pressure') / (600 * Math.max(n('efficiency') / 100, 0.1)) * 100) / 100, unit: 'kW', label: 'Potencia hidráulica requerida', note: 'La potencia real depende de pérdidas y del rendimiento global.' }
    case 'pressureLoss': { const flowM3s = Math.max(n('flow'), 0) / 60000; const diameterM = Math.max(n('diameter'), 0.1) / 1000; const lengthM = Math.max(n('length'), 0); const viscosityCst = Math.max(n('viscosity'), 0.01); const density = 860; const dynamicViscosity = viscosityCst / 1e6 * density; const area = Math.PI * diameterM ** 2 / 4; const velocity = flowM3s / Math.max(area, 1e-12); const reynolds = density * velocity * diameterM / Math.max(dynamicViscosity, 1e-12); const frictionFactor = reynolds < 2300 ? 64 / Math.max(reynolds, 1) : 0.3164 / Math.max(reynolds, 1) ** 0.25; const pressurePa = frictionFactor * (lengthM / diameterM) * (density * velocity ** 2 / 2); const pressureBar = pressurePa / 100000; return { value: Math.round(pressureBar * 1000000) / 1000000, unit: 'bar', label: 'Pérdida de carga estimada', note: `Velocidad: ${velocity.toFixed(3)} m/s · Reynolds: ${Math.round(reynolds)} · Factor de fricción: ${frictionFactor.toFixed(5)} · Caudal: ${n('flow').toFixed(2)} L/min · Diámetro: ${n('diameter').toFixed(2)} mm · Longitud: ${n('length').toFixed(2)} m · Viscosidad: ${n('viscosity').toFixed(2)} cSt. Modelo Darcy-Weisbach para tramo recto; agregue pérdidas de accesorios y valide con el fabricante.` } }
    case 'oilTemp': return { value: Math.round((n('ambient') + n('power') * 8 / Math.max(n('flow'), 1)) * 10) / 10, unit: '°C', label: 'Temperatura estimada del aceite', note: 'El tanque y el enfriador modifican el equilibrio térmico final.' }
    case 'air': { const displacement = n('displacement'); const cubicInches = values.displacementUnit === 'cc' ? displacement / 16.387064 : displacement; const volumetricEfficiency: Record<string, number> = { gasolineCarburetor: 0.8, gasolineElectronic: 2, diesel: 0.9, turbo: 3, specific: Math.max(n('specificEfficiency'), 0) }; const efficiency = volumetricEfficiency[values.engineType || 'gasolineCarburetor'] ?? 0.8; const cfm = cubicInches * Math.max(n('rpm'), 0) / 3456 * efficiency; const litersPerMinute = cfm * 28.3168466; return { value: Math.round(cfm * 100) / 100, unit: 'CFM', label: 'Flujo de aire requerido', note: `Equivalente: ${Math.round(litersPerMinute * 10) / 10} L/min. Cilindrada convertida: ${Math.round(cubicInches * 100) / 100} in³ · Eficiencia volumétrica aplicada: ${efficiency.toFixed(2)}. Seleccione un filtro con capacidad igual o mayor al flujo calculado; nunca menor.` } }
    case 'airLube': return { value: Math.round(n('flow') * n('ratio') / 100 * 10) / 10, unit: 'gotas/min', label: 'Dosificación recomendada', note: 'Ajuste con prueba de niebla y recomendación del fabricante del lubricador.' }
    case 'dewPoint': { const atmosphericDewPoint = n('air'); const ambient = n('ambient'); const gaugePressure = Math.max(n('pressure'), 0); const absolutePressure = gaugePressure + 1.01325; const magnusA = 17.625; const magnusB = 243.04; const saturationPressure = (temperature: number) => 0.61094 * Math.exp((magnusA * temperature) / (magnusB + temperature)); const atmosphericVaporPressure = saturationPressure(atmosphericDewPoint); const compressedVaporPressure = atmosphericVaporPressure * absolutePressure / 1.01325; const dewPointAtLinePressure = magnusB * Math.log(Math.max(compressedVaporPressure / 0.61094, 0.000001)) / (magnusA - Math.log(Math.max(compressedVaporPressure / 0.61094, 0.000001))); const margin = ambient - dewPointAtLinePressure; return { value: Math.round(margin * 10) / 10, unit: '°C', label: 'Margen frente a condensación', note: `Punto de rocío a presión de línea: ${dewPointAtLinePressure.toFixed(1)} °C · Presión absoluta usada: ${absolutePressure.toFixed(2)} bar(a). Al aumentar la presión, el punto de rocío calculado sube y el margen disminuye.` } }
    case 'lubricationRoute': return { value: Math.round(n('points') * n('minutes') / 60 / Math.max(n('frequency'), 1) * 100) / 100, unit: 'h/día', label: 'Tiempo promedio por ronda', note: 'Use el resultado para dimensionar rutas y ventanas de mantenimiento.' }
    case 'lubeCost': { const changes = Math.max(n('changesPerYear'), 0); const tankVolume = Math.max(n('tankCapacity'), 0); const refillAnnual = Math.max(n('refillPerMonth'), 0) * 12; const oilVolume = tankVolume * changes + refillAnnual; const oilCost = oilVolume * Math.max(n('oilPrice'), 0); const filterCost = changes * Math.max(n('filterCost'), 0); const laborCost = changes * Math.max(n('hoursPerChange'), 0) * Math.max(n('laborRate'), 0); const disposalCost = tankVolume * changes * Math.max(n('disposalRate'), 0); const labCost = Math.max(n('labCost'), 0); const total = oilCost + filterCost + laborCost + disposalCost + labCost; return { value: Math.round(total * 100) / 100, unit: 'USD/año', label: 'Costo anual de lubricación', note: `Aceite: ${oilVolume.toFixed(1)} L = $${oilCost.toFixed(2)} · Filtros: $${filterCost.toFixed(2)} · Mano de obra: $${laborCost.toFixed(2)} · Disposición: $${disposalCost.toFixed(2)} · Laboratorio: $${labCost.toFixed(2)}. Total anual: $${total.toFixed(2)} USD. Modelo: cambios + rellenos, con un filtro, mano de obra y disposición por cambio.` } }
    case 'assetCriticality': return { value: n('impact') * n('frequency') * n('detection'), unit: '/125', label: 'Índice de criticidad', note: 'Priorice activos con mayor puntuación para rutas y stock de lubricantes.' }
    case 'bearingLife': { const c = Math.max(n('dynamicLoad'), 0.01); const p = Math.max(n('equivalentLoad'), 0.01); const revolutions = Math.pow(c / p, 3) * 1000000; const hours = revolutions / Math.max(n('rpm') * 60, 1); const targetViscosity = Math.max(15, 4.5 * n('viscosityRatio') * 1000000 / Math.max(n('rpm'), 1)); return { value: Math.round(hours) , unit: 'h L10', label: 'Vida nominal estimada', note: `ISO 281: ${Math.round(revolutions).toLocaleString()} revoluciones · Viscosidad objetivo aproximada: ${Math.round(targetViscosity)} cSt a la temperatura de operación. Conecte este resultado con Viscosidad operacional y Corrección de viscosidad.` } }
    case 'chainSelection': { const correctedPower = n('power') * Math.max(n('serviceFactor'), 0.1); const ratio = Math.max(n('rpm'), 1) / Math.max(n('drivenRpm'), 1); const pitch = correctedPower < 5 ? 12.7 : correctedPower < 15 ? 19.05 : correctedPower < 35 ? 25.4 : 31.75; return { value: pitch, unit: 'mm paso', label: 'Paso preliminar de cadena', note: `Potencia corregida: ${correctedPower.toFixed(1)} kW · Relación de transmisión: ${ratio.toFixed(2)}:1 · Criterio configurable basado en DIN 8195; confirme capacidad, lubricación y fabricante.` } }
    case 'oilAnalysis': { const hoursScore = Math.min(20, Math.max(0, n('hours')) / 125); const severity = Math.min(100, Math.abs(n('viscosityChange')) * 2 + n('water') * 600 + n('iron') * 2 + n('silicon') * 1.5 + hoursScore); const action = severity >= 60 ? 'Cambiar aceite e investigar causa raíz' : severity >= 30 ? 'Programar revisión y muestreo cercano' : 'Continuar monitoreo de tendencia'; return { value: Math.round(severity), unit: '/100', label: action, note: `Índice compuesto configurable: viscosidad ${n('viscosityChange')}% · agua ${n('water')}% · hierro ${n('iron')} ppm · silicio ${n('silicon')} ppm · horas ${n('hours')} h (aporte temporal ${hoursScore.toFixed(1)} puntos). No sustituye límites del laboratorio ni OEM.` } }
    case 'greaseCoupling': { const volume = Math.max(0, (n('couplingDiameter') ** 2 - n('shaftDiameter') ** 2) * 0.0003 * n('factor')); const interval = Math.max(100, 10000000 / Math.max(n('rpm') * n('couplingDiameter'), 1) * Math.max(0.3, 1 - n('temperature') / 300)); return { value: Math.round(volume * 10) / 10, unit: 'g', label: 'Carga inicial aproximada', note: `Intervalo de revisión: ${Math.round(interval)} h · Grasa NLGI 2 de alta adhesividad como punto de partida. Referencia AGMA/OEM; confirme geometría y recomendación del fabricante.` } }
    case 'oilCorrection': { const tMeasured = Math.max(n('measuredTemp') || 40, 1); const v1 = Math.max(n('measuredViscosity'), 0.01); const vi = Math.min(Math.max(n('viscosityIndex') || 95, -50), 400); const v100Est = Math.max(0.5, v1 / (1 + (vi - 90) / 10)); const xA = Math.log10(Math.log10(tMeasured + 273.15)); const xB = Math.log10(Math.log10(100 + 273.15)); const yA = Math.log10(Math.log10(v1 + 0.7)); const yB = Math.log10(Math.log10(v100Est + 0.7)); const slope = Math.abs(tMeasured - 100) > 0.5 ? (yB - yA) / (xB - xA) : -3.7 - vi * 0.012; const x2 = Math.log10(Math.log10(Math.max(n('operatingTemp'), 1) + 273.15)); const result = Math.max(0.1, Math.pow(10, Math.pow(10, yA + slope * (x2 - xA))) - 0.7); const iso = [15, 22, 32, 46, 68, 100, 150, 220, 320, 460, 680].reduce((best, candidate) => Math.abs(candidate - result) < Math.abs(best - result) ? candidate : best, 68); return { value: Math.round(result * 10) / 10, unit: 'cSt', label: `Viscosidad a ${n('operatingTemp')} °C · ISO VG sugerido ${iso}`, note: `Modelo ASTM D341/Walther: pendiente derivada del IV ${vi} (ASTM D2270) a partir de ${v1} cSt a ${tMeasured} °C; v100 estimado ${Math.round(v100Est * 10) / 10} cSt. La clasificación ISO VG se aproxima según ISO 3448. Ingrese el IV real de la ficha técnica; el resultado es una estimación y no sustituye datos medidos del fabricante.` } }
    case 'converter': { const density = Math.max(n('density'), 0.01); const toCst: Record<string, number> = { cSt: 1, 'mm²/s': 1, cP: 1 / density, 'mPa·s': 1 / density, 'Pa·s': 1000 / density, SUS: 1 / 4.632 }; const fromCst: Record<string, number> = { cSt: 1, 'mm²/s': 1, cP: density, 'mPa·s': density, 'Pa·s': density / 1000, SUS: 4.632 }; const source = values.from || 'cSt'; const target = values.to || 'mm²/s'; const cSt = n('value') * (toCst[source] ?? 1); const converted = cSt * (fromCst[target] ?? 1); return { value: Math.round(converted * 1000) / 1000, unit: target, label: 'Viscosidad convertida', note: `Conversión entre ${source} y ${target}. Para cP, mPa·s y Pa·s se utilizó una densidad de ${density} kg/L; la relación depende de la densidad del lubricante.` } }
    default: return { value: n('value'), unit: values.to || 'u', label: 'Valor convertido', note: 'Conversión directa para unidades equivalentes.' }
  }
}


function interpretResult(id: CalcId, value: number | string) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) return 'Revise los datos ingresados antes de tomar una decisión.'
  switch (id) {
    case 'vi': return numericValue >= 120 ? 'Según el objetivo de ASTM D2270, un VI ≥ 120 indica muy poca variación de viscosidad con la temperatura: excelente estabilidad térmica.' : numericValue >= 90 ? 'ASTM D2270 clasifica este rango como estabilidad térmica media-alta, adecuada para servicio industrial convencional.' : 'VI bajo según ASTM D2270: la viscosidad cae mucho al calentar. Revise el grado del lubricante y el rango térmico de operación.'
    case 'operational': return numericValue >= 15 ? 'La curva ASTM D341 proyecta una película robusta a esa temperatura; conserva capacidad de carga hidrodinámica.' : numericValue >= 5 ? 'La viscosidad proyectada por ASTM D341 es funcional; contraste con la viscosidad mínima que exige el rodamiento o engranaje.' : 'La viscosidad proyectada es baja para formar película bajo carga; considere un grado superior. Válido dentro del rango de ajuste 40–100 °C.'
    case 'blend': return 'Estimación por el método ASTM D7152-23 (una sola temperatura) con transformación doble logarítmica; supone aceites compatibles con ambas viscosidades a la misma temperatura. La recomendación de compatibilidad de formulación es independiente del cálculo: mezclar viscosidades no certifica compatibilidad química ni equivalencia de prestaciones, aprobaciones o especificaciones de los productos originales. Confirme mediante mezcla física y ensayo de viscosidad.'
    case 'oilBath': return numericValue > 0 ? 'Volumen geométrico de referencia; mantenga el nivel del fabricante sin sobrellenar para permitir expansión térmica y disipación.' : 'El volumen calculado no es válido; revise las dimensiones ingresadas.'
    case 'dripPoint': return numericValue >= 25 ? 'El punto de goteo (ASTM D566/D2265) marca la pérdida de estructura de la grasa; este margen es cómodo para la operación indicada.' : numericValue >= 10 ? 'Margen reducido respecto al punto de goteo; controle la temperatura real y la condición de la grasa.' : 'Margen insuficiente frente al punto de goteo: seleccione una grasa con mayor estabilidad térmica (espesante de mayor punto de goteo).'
    case 'reducer': return `ISO VG ${numericValue}: selección preliminar por potencia específica y velocidad. Confirme temperatura del cárter, carga/torque, ambiente y compatibilidad con sellos; consulte AGMA 9005-F16 e ISO 12925-1 junto con el fabricante.`
    case 'bearing': return 'Carga inicial de referencia (guía SKF/FAG); aplíquela de forma uniforme y deje espacio para la purga y expansión de la grasa.'
    case 'speedFactor': return numericValue > 500 ? 'Factor DN elevado (ISO 15312): régimen de alta velocidad; seleccione una grasa apta y controle la temperatura.' : 'Factor DN moderado (ISO 15312): compatible con una selección convencional de grasa.'
    case 'greaseLife': return numericValue >= 10000 ? 'Vida F10 amplia según el modelo SKF/DIN 51825 para las condiciones ingresadas.' : numericValue >= 3000 ? 'Vida intermedia (modelo SKF/DIN 51825); programe inspecciones periódicas de condición.' : 'Vida corta según el modelo SKF/DIN 51825; considere relubricación frecuente o ajuste de velocidad y temperatura.'
    case 'relube': return numericValue >= 2000 ? 'Intervalo amplio según el modelo SKF/ISO 15257; mantenga inspecciones de condición.' : 'El modelo SKF/ISO 15257 sugiere una ruta frecuente; ajuste por contaminación, agua o vibración.'
    case 'hydraulic': return numericValue <= 15 ? 'Potencia hidráulica moderada (P = Q·p/η, ISO 4413) para el caudal indicado.' : 'Potencia significativa (P = Q·p/η, ISO 4413); revise eficiencia, pérdidas y capacidad del motor.'
    case 'pressureLoss': return numericValue <= 1 ? 'Pérdida baja por el modelo Darcy–Weisbach; favorable para la eficiencia de la línea.' : 'Pérdida relevante (Darcy–Weisbach); revise diámetro, longitud, accesorios y viscosidad del fluido.'
    case 'oilTemp': return numericValue <= 55 ? 'Temperatura dentro de un rango favorable para la vida del aceite (la oxidación se duplica cada ~10 °C sobre 60 °C).' : numericValue <= 75 ? 'Temperatura elevada; verifique enfriamiento y que la viscosidad a esa temperatura siga siendo adecuada.' : 'Temperatura crítica: acelera la oxidación del aceite; revise disipación, enfriador y condición del fluido.'
    case 'airLube': return 'Dosis proporcional al consumo de aire; ajuste el lubricador gradualmente y confirme la niebla en el punto de consumo.'
    case 'dewPoint': return numericValue >= 10 ? 'Margen favorable frente al punto de rocío (ISO 8573-1) a la presión indicada: bajo riesgo de condensado.' : numericValue >= 3 ? 'Margen reducido frente al punto de rocío (ISO 8573-1); revise secador, presión y aislamiento de la red.' : 'Alto riesgo de condensación (ISO 8573-1); reduzca humedad o temperatura y revise el tratamiento de aire.'
    case 'lubricationRoute': return 'Tiempo total de la ronda; úselo para dimensionar la ruta y equilibrar la carga del equipo técnico.'
    case 'lubeCost': return 'Costo anual proyectado (aceite, filtros, mano de obra, disposición y laboratorio); base para presupuestar y comparar mejoras del programa de lubricación.'
    case 'assetCriticality': return numericValue >= 60 ? 'Índice de riesgo alto (enfoque FMEA/IEC 60812): active prioritario; asegure lubricación, monitoreo y repuestos.' : numericValue >= 25 ? 'Riesgo medio (FMEA/IEC 60812); mantenga controles programados.' : 'Riesgo relativo bajo (FMEA/IEC 60812); conserve la inspección rutinaria.'
    case 'converter': return 'Conversión normalizada entre unidades de viscosidad; la relación dinámica-cinemática depende de la densidad ingresada.'
    case 'air': return 'Flujo de aire requerido por el motor (SAE J1349); dimensione el filtro para ese caudal con margen de suciedad.'
    case 'isoCst': return 'La norma ISO 3448 define cada grado por su viscosidad a 40 °C con tolerancia ±10 %; este valor es el punto nominal.'
    case 'saybolt': return 'Conversión SUS→cSt (ASTM D2161); válida en el rango habitual, confirme en los extremos con la tabla de la norma.'
    case 'bearingLife': return numericValue >= 20000 ? 'Vida L10 amplia según ISO 281 (L10 = (C/P)^p); confirme lubricación y contaminación reales.' : 'Vida L10 según ISO 281 (L10 = (C/P)^p); revise carga equivalente, viscosidad y limpieza para no reducirla.'
    case 'chainSelection': return 'Potencia corregida por factor de servicio (DIN 8195); use el paso como preselección y valide con la tabla del fabricante.'
    case 'oilAnalysis': return 'Nivel de alerta por tendencia de viscosidad, agua, hierro y silicio contra límites del laboratorio/OEM (enfoque ASTM D7720); priorice la acción según el parámetro más desviado.'
    case 'greaseCoupling': return 'Consistencia y cantidad de referencia (AGMA 9001/OEM); en coples la grasa debe resistir separación por fuerza centrífuga.'
    case 'oilCorrection': return 'La viscosidad se corrige con la temperatura mediante ASTM D341 y se clasifica en ISO VG (ISO 3448). Confirme con la Ficha Técnica (SDS) y las condiciones reales del equipo.'
    default: return 'Interprete el resultado junto con la Ficha Técnica (SDS) y las condiciones reales del equipo.'
  }
}

export default function Page() {
  const [active, setActive] = useState<CalcId>('vi')
  const [category, setCategory] = useState<Category>('Todas')
  const [query, setQuery] = useState('')
  const [values, setValues] = useState(defaults.vi)
  const [favorites, setFavorites] = useState<CalcId[]>(['vi', 'operational', 'blend', 'oilBath'])
  const [history, setHistory] = useState<CalcId[]>(['vi', 'bearing', 'relube'])
  const [guide, setGuide] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [blendMode, setBlendMode] = useState<'ratio' | 'target'>('target')
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [manual, setManual] = useState(false)
  const [manualOpenEntry, setManualOpenEntry] = useState<CalcId | null>(null)
  const [order, setOrder] = useState<CalcId[]>(() => calculators.map((calc) => calc.id))
  const [draggingId, setDraggingId] = useState<CalcId | null>(null)
  const dragState = useRef<{ id: CalcId | null; startX: number; startY: number; timer: ReturnType<typeof setTimeout> | null; dragging: boolean; moved: boolean }>({ id: null, startX: 0, startY: 0, timer: null, dragging: false, moved: false })
  const justDraggedRef = useRef(false)
  const toggleGroup = (group: string) => setOpenGroup((current) => current === group ? null : group)
  const groupedCalculators = (group: Exclude<Category, 'Todas'>) => calculators.filter((calc) => calc.category === group)

  useEffect(() => {
    if (!isCalculatorOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsCalculatorOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isCalculatorOpen])

  const selected = calculators.find((calc) => calc.id === active) || calculators[0]
  const result = calculate(active, values)
  const interpretation = interpretResult(active, result.value)
  const fuse = useMemo(() => new Fuse(calculators, { keys: ['title', 'category', 'description', 'metric'], threshold: 0.4, ignoreLocation: true }), [])
  const filtered = useMemo(() => {
    const byCategory = calculators.filter((calc) => category === 'Todas' || calc.category === category)
    const trimmed = query.trim()
    const list = trimmed
      ? fuse.search(trimmed).map((match) => match.item).filter((calc) => category === 'Todas' || calc.category === category)
      : byCategory
    return [...list].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
  }, [category, query, order, fuse])

  function openCalculator(id: CalcId) { setActive(id); setValues(id === 'blend' ? { ...defaults[id], mode: blendMode } : { ...defaults[id] }); setHistory((prev) => [id, ...prev.filter((item) => item !== id)].slice(0, 5)); setIsCalculatorOpen(true) }
  function blankValues(id: CalcId) { return Object.fromEntries(Object.keys(defaults[id]).map((key) => [key, ''])) }
  function resetCalculator() { setValues(blankValues(active)) }
  function toggleFavorite(id: CalcId) { setFavorites((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]) }
  const update = (key: string, value: string) => setValues((prev) => ({ ...prev, [key]: value }))

  function reorderCards(sourceId: CalcId, targetId: CalcId) {
    if (sourceId === targetId) return
    setOrder((prev) => {
      const next = [...prev]
      const from = next.indexOf(sourceId)
      const to = next.indexOf(targetId)
      if (from === -1 || to === -1) return prev
      next.splice(from, 1)
      next.splice(to, 0, sourceId)
      return next
    })
  }

  function handleCardPointerDown(event: React.PointerEvent<HTMLElement>, id: CalcId) {
    const target = event.target as HTMLElement
    if (target.closest('button')) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const state = dragState.current
    state.id = id
    state.startX = event.clientX
    state.startY = event.clientY
    state.moved = false
    state.dragging = false
    const el = event.currentTarget
    const pointerId = event.pointerId
    if (state.timer) clearTimeout(state.timer)
    state.timer = setTimeout(() => {
      if (state.id === id && !state.moved) {
        state.dragging = true
        setDraggingId(id)
        try { el.setPointerCapture(pointerId) } catch {}
      }
    }, 220)
  }

  function handleCardPointerMove(event: React.PointerEvent<HTMLElement>) {
    const state = dragState.current
    if (!state.id) return
    const dx = event.clientX - state.startX
    const dy = event.clientY - state.startY
    if (!state.dragging) {
if (Math.hypot(dx, dy) > 10) {
  state.moved = true
  if (state.timer) clearTimeout(state.timer)
  window.getSelection()?.removeAllRanges()
  event.preventDefault()
  event.currentTarget.style.userSelect = 'none'
  }
      return
    }
    event.preventDefault()
    const el = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null
    const card = el?.closest('.catalog-card') as HTMLElement | null
    const overId = card?.getAttribute('data-calc-id') as CalcId | null
    if (overId && overId !== state.id) reorderCards(state.id, overId)
  }

  function handleCardPointerUp(event: React.PointerEvent<HTMLElement>) {
    const state = dragState.current
    if (state.timer) clearTimeout(state.timer)
    if (state.dragging || state.moved) {
      window.getSelection()?.removeAllRanges()
      event.preventDefault()
      justDraggedRef.current = true
      setTimeout(() => { justDraggedRef.current = false }, 0)
    }
    state.id = null
    state.dragging = false
    state.moved = false
    setDraggingId(null)
  }

  function handleCardPointerCancel() {
    const state = dragState.current
    if (state.timer) clearTimeout(state.timer)
    state.id = null
    state.dragging = false
    state.moved = false
    setDraggingId(null)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {mobileNav && <div className="sidebar-backdrop" role="presentation" onClick={() => setMobileNav(false)} />}
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand"><div className="brand-mark"><Droplets size={18} /></div><div><strong>Lubri<span>Calc</span></strong><small>Widman Engineering</small></div><button className="mobile-close" onClick={() => setMobileNav(false)} aria-label="Cerrar menú"><X size={18} /></button></div>
        <div className="workspace-label">CENTRO DE HERRAMIENTAS</div>
        <nav className="sidebar-library" aria-label="Biblioteca técnica"><button className="nav-item active" onClick={() => setCategory('Todas')}><Calculator size={17} /> Biblioteca técnica <span className="nav-count">{calculators.length}</span></button>{(['Lubricación', 'Conversión', 'Rodamientos', 'Hidráulica', 'Aire', 'Mantenimiento', 'Ingeniería'] as Exclude<Category, 'Todas'>[]).map((group) => <div className="nav-group" key={group}><button className={`nav-item nav-group-toggle ${openGroup === group ? 'is-expanded' : ''}`} onClick={() => toggleGroup(group)} aria-expanded={openGroup === group}>{(() => { const GroupIcon = categoryIcons[group]; return <><GroupIcon size={17} className="nav-group-icon" /><span className="nav-group-name">{group}</span></> })()}<ChevronDown size={15} className="nav-group-chevron" /></button>{openGroup === group && <div className="nav-submenu">{groupedCalculators(group).map((calc) => <button key={calc.id} className={`nav-subitem ${active === calc.id ? 'is-current' : ''}`} onClick={() => { openCalculator(calc.id); setMobileNav(false) }}><span className={`nav-subdot ${calc.accent}`} />{calc.title}</button>)}</div>}</div>)}<button className="nav-item" onClick={() => setManual(true)}><BookOpen size={17} /> Manual de calculadoras</button><button className="nav-item" onClick={() => setGuide(true)}><BookOpen size={17} /> Guía de uso</button></nav>
        <div className="sidebar-bottom"><div className="status"><span className="status-dot" /> <small>Juan Montiel</small></div><button className="nav-item"><Settings2 size={17} /> Preferencias</button></div>
      </aside>
      <div className="shell">
        <header className="topbar"><button className="menu-button" onClick={() => setMobileNav(true)} aria-label="Abrir menú"><Menu size={20} /></button><div className="crumb">LUBRICALC <span>/</span> CALCULADORAS</div><div className="top-actions"><a className="widman-link" href="https://www.widman.biz" target="_blank" rel="noreferrer">Visitar Widman.biz <ArrowRight size={16} /></a></div></header>
        <div className="content">
          <section className="hero"><div><h1>Decisiones técnicas,<br /><em>con más precisión.</em></h1><p>Calculadoras de lubricación y mantenimiento para transformar datos de planta en acciones confiables.</p><div className="hero-actions"><button className="primary-button" onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })}>Explorar calculadoras <ArrowRight size={16} /></button><button className="quiet-button" onClick={() => setGuide(true)}><BookOpen size={16} /> Ver guía rápida</button></div></div><div className="hero-brand" aria-label="Widman International S.R.L."><img src="/widman-logo.png" alt="Logotipo de Widman International S.R.L." /></div></section>
          <ViscosityPlot />
          <section className="metrics"><div><span>HERRAMIENTAS DISPONIBLES</span><strong>28</strong><small>cálculos especializados</small></div><div><span>ÁREAS DE APLICACIÓN</span><strong>07</strong><small>disciplinas de mantenimiento</small></div><div><span>ESTÁNDARES REFERENCIADOS</span><strong>17</strong><small>ASTM · ISO · API · AGMA · DIN · SKF</small></div><div><span>CANTIDAD DE VISITAS</span><strong>1250</strong><small>visitas a la fecha</small></div></section>
          <section className="section-head"><div><div className="section-kicker">ACCESO RÁPIDO</div><h2>Calculadoras destacadas</h2></div><button className="text-button" onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })}>Ver catálogo completo <ArrowRight size={15} /></button></section>
          <div className="featured-grid">{favorites.length > 0 ? favorites.map((id) => calculators.find((calc) => calc.id === id)).filter((calc): calc is Calc => Boolean(calc)).map((calc) => <button className="featured-card" key={calc.id} onClick={() => openCalculator(calc.id)}><div className={`tool-icon ${calc.accent}`}><calc.icon size={21} /></div><div className="featured-copy"><span>{calc.category}</span><h3>{calc.title}</h3><p>{calc.description}</p><div className="card-foot"><small>{calcSpec[calc.id].basis}</small><ArrowRight size={15} /></div></div></button>) : <div className="empty-featured"><Star size={18} /><span>Marca una calculadora como favorita para tenerla aquí.</span></div>}</div>
          <section id="catalogo" className="catalog-section"><div className="section-head catalog-head"><div><div className="section-kicker">BIBLIOTECA TÉCNICA</div><h2>Todas las herramientas</h2></div><div className="catalog-controls"><div className="search-field"><Search size={15} /><input aria-label="Filtrar catálogo" placeholder="Filtrar por nombre..." value={query} onChange={(e) => setQuery(e.target.value)} /></div></div></div><div className="category-tabs">{(['Todas', 'Lubricación', 'Conversión', 'Rodamientos', 'Hidráulica', 'Aire', 'Mantenimiento', 'Ingeniería'] as Category[]).map((item) => <button key={item} className={category === item ? 'tab active-tab' : 'tab'} onClick={() => setCategory(item)}>{item}</button>)}</div>          <div className="catalog-grid">{filtered.map((calc) => <article className={`catalog-card ${draggingId === calc.id ? 'is-dragging' : ''}`} data-calc-id={calc.id} data-accent={calc.accent} data-card-tone={`tone-${calculators.findIndex((item) => item.id === calc.id) % 4}`} draggable={false} key={calc.id} onDragStart={(event) => event.preventDefault()} onSelect={(event) => event.preventDefault()} onClick={() => { if (justDraggedRef.current) return; openCalculator(calc.id) }} onPointerDown={(event) => handleCardPointerDown(event, calc.id)} onPointerMove={handleCardPointerMove} onPointerUp={handleCardPointerUp} onPointerCancel={handleCardPointerCancel} tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') openCalculator(calc.id) }}><div className="catalog-top"><div className={`tool-icon small ${calc.accent}`}><calc.icon size={18} /></div><button type="button" className={`favorite ${favorites.includes(calc.id) ? 'is-favorite' : ''}`} onClick={(event) => { event.stopPropagation(); toggleFavorite(calc.id) }} onKeyDown={(event) => event.stopPropagation()} aria-pressed={favorites.includes(calc.id)} aria-label={`${favorites.includes(calc.id) ? 'Quitar' : 'Añadir'} favorito`}><Star size={16} fill={favorites.includes(calc.id) ? 'currentColor' : 'none'} /></button></div><div className="catalog-body"><span className="category-label">{calc.category}</span><h3>{calc.title}</h3><p>{calc.description}</p></div><div className="catalog-bottom"><span>{calcSpec[calc.id].basis}</span><button type="button" onClick={(event) => { event.stopPropagation(); openCalculator(calc.id) }}>Abrir herramienta <ArrowRight size={14} /></button></div></article>)}</div></section>
          {isCalculatorOpen && <div className="calculator-modal-backdrop" role="presentation" onMouseDown={() => setIsCalculatorOpen(false)}><section className="calculator-modal" role="dialog" aria-modal="true" aria-labelledby="calculator-modal-title" onMouseDown={(event) => event.stopPropagation()}><div className="workbench-head"><div><div className="section-kicker">ÁREA DE TRABAJO</div><h2 id="calculator-modal-title">{selected.title}</h2><p>{selected.description}</p></div><div className="workbench-actions"><button className="quiet-button" type="button" onClick={resetCalculator}>Reset</button><button className="modal-close" onClick={() => setIsCalculatorOpen(false)} aria-label="Cerrar calculadora"><X size={18} /></button></div></div><div className="calculator-layout"><div className="input-panel"><div className="panel-title"><span>01</span><div><strong>Datos de entrada</strong><small>Introduzca valores de placa o medición</small></div></div>{active === 'blend' ? <BlendFields mode={blendMode} setMode={(mode) => { setBlendMode(mode); update('mode', mode) }} values={values} update={update} /> : <InputFields id={active} values={values} update={update} />}<div className="input-note"><Info size={15} /><span>Use el punto como separador decimal. Los resultados son aproximados y deben validarse contra el fabricante.</span></div><div className="input-basis"><strong>Método y referencia</strong><div className="spec-row"><span className="spec-key">Base técnica</span><span className="spec-val">{calcSpec[active].basis}</span></div><div className="spec-row"><span className="spec-key">Tipo de modelo</span><span className="spec-val">{calcSpec[active].modelType}</span></div><div className="spec-row"><span className="spec-key">Salida</span><span className="spec-val">{calcSpec[active].output}</span></div><div className="spec-row"><span className="spec-key">Nivel de aplicación</span><span className="spec-val">{calcSpec[active].application}</span></div></div></div><div className="result-panel"><div className="result-label"><span className="result-pulse" /> RESULTADO ESTIMADO</div><div className="result-value"><strong>{result.value}</strong><span>{result.unit}</span></div><p>{result.label}</p>{active === 'isoCst' && (() => { const grade = Number(values.iso) || 0; if (!grade) return null; const min = Math.round(grade * 0.9 * 10) / 10; const max = Math.round(grade * 1.1 * 10) / 10; return <p className="result-range">{min} &ndash; {max} cSt <span>rango admisible &plusmn;10&thinsp;% (ISO 3448)</span></p> })()}<div className="result-bar"><span style={{ width: `${Math.min(Math.max(Number(result.value) || 0, 12), 100)}%` }} /></div><div className="result-note"><Info size={15} /><span>{calcSpec[active].specNote}</span></div><button className="save-button" type="button"><Heart size={16} /> Guardar en mi historial</button><div className="result-interpretation"><strong>Interpretación técnica</strong><span>{interpretation}</span></div><div className="formula"><span>CRITERIO DE CÁLCULO</span><code>{active === 'vi' ? 'VI = f (ν40, ν100, temperatura)' : active === 'bearing' ? 'G = (D − d) × B × factor' : 'Resultado = datos de entrada + criterio técnico'}</code></div><button className="save-button" onClick={() => setHistory((prev) => [active, ...prev.filter((item) => item !== active)].slice(0, 5))}><Heart size={15} /> </button></div></div></section></div>}
          <section className="history-row"><div><div className="section-kicker">ACTIVIDAD RECIENTE</div><h2>Últimas herramientas</h2></div><div className="history-list">{history.map((id, index) => { const item = calculators.find((c) => c.id === id)!; return <button key={`${id}-${index}`} onClick={() => openCalculator(id)}><div className={`history-icon ${item.accent}`}><item.icon size={16} /></div><div><strong>{item.title}</strong><small>{index === 0 ? 'Ahora' : `${index * 12} min atrás`} · {calcSpec[item.id].basis}</small></div><ChevronDown size={15} /></button> })}</div></section>
        </div>
      </div>
      {guide && <div className="modal-backdrop" onClick={() => setGuide(false)}><div className="guide-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setGuide(false)} aria-label="Cerrar guía"><X size={18} /></button><div className="tool-icon amber"><BookOpen size={20} /></div><div className="section-kicker">GUÍA RÁPIDA</div><h2>Cómo usar LubriCalc</h2><p>Selecciona una herramienta, carga datos reales de placa o medición y revisa el resultado junto a su criterio técnico.</p><div className="guide-steps"><div><b>01</b><span><strong>Selecciona</strong><small>Elige una calculadora por disciplina o busca por nombre.</small></span></div><div><b>02</b><span><strong>Calcula</strong><small>Completa los campos con unidades consistentes.</small></span></div><div><b>03</b><span><strong>Valida</strong><small>Contrasta la recomendación con manuales y normas del fabricante.</small></span></div></div><div className="modal-warning"><Info size={16} /> Esta aplicación entrega estimaciones para apoyar decisiones. No reemplaza la ingeniería del fabricante.</div></div></div>}
      {manual && <div className="modal-backdrop" onClick={() => setManual(false)}><div className="manual-modal" onClick={(e) => e.stopPropagation()}><div className="manual-head"><div><div className="section-kicker">BIBLIOTECA DE REFERENCIA</div><h2>Manual de calculadoras</h2><p>Descripción, uso recomendado y pasos de aplicación para cada herramienta.</p></div><button className="modal-close" onClick={() => setManual(false)} aria-label="Cerrar manual"><X size={18} /></button></div><div className="manual-list">{calculators.map((calc) => <details className="manual-entry" key={calc.id} open={manualOpenEntry === calc.id}><summary onClick={(event) => { event.preventDefault(); setManualOpenEntry((current) => current === calc.id ? null : calc.id); }}><span className={`tool-icon small ${calc.accent}`}><calc.icon size={16} /></span><span><strong>{calc.title}</strong><small>{calc.category} · {calcSpec[calc.id].basis}</small></span><ChevronDown size={16} /></summary><div className="manual-content"><p>{calc.description}</p><p><strong>¿Para qué se usa?</strong> Para apoyar decisiones de selección, inspección o mantenimiento relacionadas con {calc.category.toLowerCase()}.</p><p><strong>¿Cómo se usa?</strong> Abra la calculadora, complete los campos con datos de placa o medición y revise el resultado junto con su interpretación técnica.</p><p><strong>Base técnica</strong> {calcSpec[calc.id].basis} · <strong>Modelo</strong> {calcSpec[calc.id].modelType} · <strong>Salida</strong> {calcSpec[calc.id].output} · <strong>Aplicación</strong> {calcSpec[calc.id].application}</p></div></details>)}</div></div></div>}
    </main>
  )
}

type Lubricant = { id: number; name: string; v40: string; v100: string }

const plotColors = ['#d99a32', '#168b86', '#2f719d', '#b75d3c', '#735fa7', '#d14d72']

function viscosityAtTemperature(v40: number, v100: number, temperature: number) {
  const safe40 = Math.max(v40, 0.1)
  const safe100 = Math.max(v100, 0.1)
  const z40 = Math.log10(Math.log10(safe40 + 0.7))
  const z100 = Math.log10(Math.log10(safe100 + 0.7))
  const b = (z100 - z40) / (1 / (100 + 273.15) - 1 / (40 + 273.15))
  const a = z40 - b / (40 + 273.15)
  const z = a + b / (temperature + 273.15)
  return Math.max(0.1, Math.pow(10, Math.pow(10, z)) - 0.7)
}

function ViscosityPlot() {
  const [lubricants, setLubricants] = useState<Lubricant[]>([
    { id: 1, name: 'Lubricante A', v40: '220', v100: '14.2' },
    { id: 2, name: 'Lubricante B', v40: '150', v100: '16.1' },
  ])
  const [minTemp, setMinTemp] = useState('20')
  const [maxTemp, setMaxTemp] = useState('120')
  const [step, setStep] = useState('10')
  const parsedMin = Number(minTemp)
  const parsedMax = Number(maxTemp)
  const parsedStep = Number(step)
  const min = Number.isFinite(parsedMin) ? parsedMin : 20
  const max = Math.max(Number.isFinite(parsedMax) ? parsedMax : 120, min + 1)
  const increment = Math.max(Number.isFinite(parsedStep) ? parsedStep : 10, 1)
  const temperatures = Array.from({ length: Math.floor((max - min) / increment) + 1 }, (_, index) => min + index * increment)
  const data = temperatures.map((temperature) => Object.fromEntries([
    ['temperature', temperature],
    ...lubricants.map((lubricant) => [String(lubricant.id), viscosityAtTemperature(Number(lubricant.v40), Number(lubricant.v100), temperature)]),
  ]))
  const tableRows = temperatures.map((temperature) => ({ temperature, values: lubricants.map((lubricant) => viscosityAtTemperature(Number(lubricant.v40), Number(lubricant.v100), temperature)) }))
  const viscosityValues = data.flatMap((row) => lubricants.map((lubricant) => Number(row[String(lubricant.id)])).filter((value) => Number.isFinite(value) && value > 0))
  const rawYMin = Math.min(...viscosityValues)
  const rawYMax = Math.max(...viscosityValues)
  const yMin = Math.pow(10, Math.floor(Math.log10(Math.max(rawYMin, 1))))
  const yMax = Math.pow(10, Math.ceil(Math.log10(Math.max(rawYMax, 10))))
  const yTicks = Array.from({ length: Math.max(1, Math.ceil(Math.log10(yMax)) - Math.floor(Math.log10(yMin)) + 1) * 9 }, (_, index) => { const exponent = Math.floor(Math.log10(yMin)) + Math.floor(index / 9); return (index % 9 + 1) * Math.pow(10, exponent) }).filter((tick) => tick >= yMin && tick <= yMax)
  const updateLubricant = (id: number, key: keyof Lubricant, value: string) => setLubricants((items) => items.map((item) => item.id === id ? { ...item, [key]: value } : item))

  return <section className="viscosity-tool" id="viscosidad-temperatura">
    <div className="viscosity-head"><div><div className="section-kicker">ANÁLISIS DE LUBRICANTES</div><h2>Viscosidad vs. temperatura</h2><p>Analice desde un lubricante hasta seis mediante el modelo ASTM D341 / Walther.</p></div><div className="plot-badge"><Thermometer size={16} /><span>cSt · °C</span></div></div>
    <div className="viscosity-layout">
      <div className="viscosity-controls"><div className="panel-title"><span>01</span><div><strong>Configuración del ensayo</strong><small>Valores cinemáticos medidos</small></div></div><div className="lubricant-list">{lubricants.map((lubricant, index) => <div className="lubricant-row" key={lubricant.id}><div className="lubricant-index" style={{ color: plotColors[index] }}>{String(index + 1).padStart(2, '0')}</div><div className="lubricant-fields"><label>Nombre<input value={lubricant.name} onChange={(e) => updateLubricant(lubricant.id, 'name', e.target.value)} /></label><label>cSt a 40 °C<input inputMode="decimal" value={lubricant.v40} onChange={(e) => updateLubricant(lubricant.id, 'v40', e.target.value)} /></label><label>cSt a 100 °C<input inputMode="decimal" value={lubricant.v100} onChange={(e) => updateLubricant(lubricant.id, 'v100', e.target.value)} /></label></div>{lubricants.length > 1 && <button className="remove-lubricant" onClick={() => setLubricants((items) => items.filter((item) => item.id !== lubricant.id))} aria-label={`Eliminar ${lubricant.name}`}><Trash2 size={15} /></button>}</div>)}</div><div className="plot-settings"><label>Temperatura mínima (°C)<input inputMode="numeric" value={minTemp} onChange={(e) => setMinTemp(e.target.value)} /></label><label>Temperatura máxima (°C)<input inputMode="numeric" value={maxTemp} onChange={(e) => setMaxTemp(e.target.value)} /></label><label>Incremento (°C)<input inputMode="numeric" value={step} onChange={(e) => setStep(e.target.value)} /></label></div><button className="add-lubricant" disabled={lubricants.length >= 6} onClick={() => setLubricants((items) => [...items, { id: Date.now(), name: `Lubricante ${String.fromCharCode(65 + items.length)}`, v40: '100', v100: '14' }])}><Plus size={15} /> Añadir lubricante <span>{lubricants.length}/6</span></button><div className="plot-note"><Info size={14} /> El modelo extrapola la tendencia entre los dos puntos de viscosidad ingresados.</div></div>
      <div className="viscosity-chart-card"><div className="chart-summary"><div><span>RANGO DE TEMPERATURA</span><strong>{min} a {max} °C</strong></div><div><span>CURVAS ACTIVAS</span><strong>{lubricants.length}</strong></div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 12, right: 18, left: 2, bottom: 18 }}><CartesianGrid strokeDasharray="3 3" stroke="#dce4e8" vertical={false} /><XAxis dataKey="temperature" type="number" domain={[min, max]} ticks={temperatures} interval={0} allowDataOverflow allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#71808a' }} label={{ value: 'Temperatura (°C)', position: 'insideBottom', offset: -8, fontSize: 10, fill: '#71808a' }} /><YAxis scale="log" domain={[yMin, yMax]} ticks={yTicks} allowDataOverflow={false} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#71808a' }} width={48} label={{ value: 'Viscosidad (cSt)', angle: -90, position: 'insideLeft', offset: 10, textAnchor: 'middle', fontSize: 10, fill: '#71808a' }} /><Tooltip contentStyle={{ border: '1px solid #dce4e8', borderRadius: 8, fontSize: 11 }} labelFormatter={(value) => `${value} °C`} formatter={(value, name) => [`${Number(value).toFixed(1)} cSt`, lubricants.find((item) => String(item.id) === String(name))?.name || name]} />{lubricants.map((lubricant, index) => <Line key={lubricant.id} type="monotone" dataKey={String(lubricant.id)} name={lubricant.name} stroke={plotColors[index]} strokeWidth={2.5} dot={false} connectNulls />)}</LineChart></ResponsiveContainer></div><div className="chart-legend">{lubricants.map((lubricant, index) => <span key={lubricant.id}><i style={{ background: plotColors[index] }} />{lubricant.name}</span>)}</div></div>
    </div>
    <details className="viscosity-table-wrap"><summary className="table-heading"><div><strong>Tabla de viscosidades estimadas</strong><small>{tableRows.length} filas · Cada {increment} °C · Valores calculados sobre el rango seleccionado</small></div><span>Modelo Walther <ChevronDown size={16} /></span></summary><div className="viscosity-table-scroll"><table><thead><tr><th>Temperatura</th>{lubricants.map((lubricant, index) => <th key={lubricant.id}><i style={{ background: plotColors[index] }} />{lubricant.name}</th>)}</tr></thead><tbody>{tableRows.map((row) => <tr key={row.temperature}><td>{row.temperature} °C</td>{row.values.map((value, index) => <td key={index}>{value.toFixed(1)} <small>cSt</small></td>)}</tr>)}</tbody></table></div></details>
  </section>
}

function BlendFields({ mode, setMode, values, update }: { mode: 'ratio' | 'target'; setMode: (mode: 'ratio' | 'target') => void; values: Record<string, string>; update: (key: string, value: string) => void }) {
  return <div className="blend-fields"><div className="blend-mode-tabs" role="tablist" aria-label="Modo de cálculo"><button type="button" role="tab" aria-selected={mode === 'target'} className={mode === 'target' ? 'active' : ''} onClick={() => setMode('target')}>Porcentaje de mezcla</button><button type="button" role="tab" aria-selected={mode === 'ratio'} className={mode === 'ratio' ? 'active' : ''} onClick={() => setMode('ratio')}>Viscosidad final</button></div><div className="fields-grid"><label>Viscosidad aceite 1<input inputMode="decimal" value={values.oilA || ''} onChange={(e) => update('oilA', e.target.value)} /><small>cSt a {values.temperature || '40'} °C</small></label><label>Viscosidad aceite 2<input inputMode="decimal" value={values.oilB || ''} onChange={(e) => update('oilB', e.target.value)} /><small>cSt a {values.temperature || '40'} °C</small></label>{mode === 'ratio' ? <label>Porcentaje del aceite 1<input inputMode="decimal" value={values.ratio || ''} onChange={(e) => update('ratio', e.target.value)} /><small>% v/v</small></label> : <label>Viscosidad deseada<input inputMode="decimal" value={values.target || ''} onChange={(e) => update('target', e.target.value)} /><small>cSt</small></label>}<label>Temperatura de referencia<input inputMode="decimal" value={values.temperature || ''} onChange={(e) => update('temperature', e.target.value)} placeholder="40" /><small>°C · ambas viscosidades a esta temperatura</small></label></div></div>
}

function InputFields({ id, values, update }: { id: CalcId; values: Record<string, string>; update: (key: string, value: string) => void }) {
  const selectOptions: Record<string, { value: string; label: string }[]> = {
    unit: [{ value: 'api', label: 'Grados API' }, { value: 'sg', label: 'Gravedad específica' }, { value: 'kgl', label: 'Kilos por litro' }, { value: 'lbgal', label: 'Libras por galón' }], displacementUnit: [{ value: 'cc', label: 'Centímetros cúbicos (cc)' }, { value: 'in3', label: 'Pulgadas cúbicas (in³)' }], engineType: [{ value: 'gasolineCarburetor', label: 'Gasolina con carburador · VE 0.80' }, { value: 'gasolineElectronic', label: 'Gasolina electrónica · VE 2.00' }, { value: 'diesel', label: 'Diésel · VE 0.90' }, { value: 'turbo', label: 'Turbo · VE 3.00' }, { value: 'specific', label: 'Digitar un valor específico' }],
    from: [{ value: 'cSt', label: 'Centistokes (cSt)' }, { value: 'mm²/s', label: 'mm²/s' }, { value: 'cP', label: 'Centipoises (cP)' }, { value: 'mPa·s', label: 'Milipascal-segundo (mPa·s)' }, { value: 'Pa·s', label: 'Pascal-segundo (Pa·s)' }, { value: 'SUS', label: 'Saybolt Universal (SUS)' }],
    to: [{ value: 'cSt', label: 'Centistokes (cSt)' }, { value: 'mm²/s', label: 'mm²/s' }, { value: 'cP', label: 'Centipoises (cP)' }, { value: 'mPa·s', label: 'Milipascal-segundo (mPa·s)' }, { value: 'Pa·s', label: 'Pascal-segundo (Pa·s)' }, { value: 'SUS', label: 'Saybolt Universal (SUS)' }],
    lubrication: [{ value: 'splash', label: 'Salpicadura' }, { value: 'circulation', label: 'Recirculación por bomba' }],
    reduction: [{ value: 'simple', label: 'Simple (<10:1)' }, { value: 'multiple', label: 'Múltiple (>10:1)' }],
  }
  const fields: Record<CalcId, { key: string; label: string; unit: string; hint?: string }[]> = {
    vi: [{ key: 'v40', label: 'Viscosidad a 40 °C', unit: 'cSt' }, { key: 'v100', label: 'Viscosidad a 100 °C', unit: 'cSt' }],
    operational: [{ key: 'viscosity40', label: 'Viscosidad a 40 °C', unit: 'cSt' }, { key: 'viscosity100', label: 'Viscosidad a 100 °C', unit: 'cSt' }, { key: 'operating', label: 'Temperatura de operación', unit: '°C' }],
    blend: [{ key: 'oilA', label: 'Viscosidad aceite A', unit: 'cSt' }, { key: 'oilB', label: 'Viscosidad aceite B', unit: 'cSt' }, { key: 'ratio', label: 'Proporción aceite A', unit: '%' }],
    oilBath: [{ key: 'length', label: 'Largo del cárter', unit: 'cm' }, { key: 'width', label: 'Ancho del cárter', unit: 'cm' }, { key: 'height', label: 'Altura útil', unit: 'cm' }, { key: 'fill', label: 'Nivel de llenado', unit: '%' }],
    dripPoint: [{ key: 'drip', label: 'Punto de goteo', unit: '°C' }, { key: 'operating', label: 'Temperatura operación', unit: '°C' }, { key: 'safety', label: 'Margen de seguridad', unit: '°C' }],
    api: [{ key: 'value', label: 'Valor a convertir a 15.6 °C (60 °F)', unit: '' }, { key: 'unit', label: 'Unidad de entrada', unit: '' }],
    isoCst: [{ key: 'iso', label: 'Grado ISO VG', unit: 'cSt' }],
    saybolt: [{ key: 'sus', label: 'Saybolt Universal', unit: 'SUS' }],
    reducer: [{ key: 'lubrication', label: 'Tipo de lubricación', unit: '' }, { key: 'reduction', label: 'Tipo de reducción', unit: '' }, { key: 'hp', label: 'Potencia del reductor', unit: 'HP' }, { key: 'rpm', label: 'Velocidad del reductor', unit: 'rpm' }],
    bearing: [{ key: 'od', label: 'Diámetro exterior', unit: 'mm' }, { key: 'id', label: 'Diámetro interior', unit: 'mm' }, { key: 'width', label: 'Ancho del rodamiento', unit: 'mm' }, { key: 'fill', label: 'Factor de llenado', unit: '%' }],
    speedFactor: [{ key: 'dm', label: 'Diámetro medio', unit: 'mm' }, { key: 'rpm', label: 'Velocidad', unit: 'rpm' }],
    greaseLife: [{ key: 'speed', label: 'Velocidad', unit: 'rpm' }, { key: 'temp', label: 'Temperatura', unit: '°C' }, { key: 'load', label: 'Factor de carga', unit: 'x' }],
    relube: [{ key: 'speed', label: 'Velocidad de giro', unit: 'rpm' }, { key: 'dm', label: 'Diámetro medio', unit: 'mm' }, { key: 'temp', label: 'Temperatura de operación', unit: '°C' }, { key: 'vibration', label: 'Vibración RMS', unit: 'mm/s' }, { key: 'humidity', label: 'Humedad relativa', unit: '%' }],
    hydraulic: [{ key: 'flow', label: 'Caudal del sistema', unit: 'L/min' }, { key: 'pressure', label: 'Presión de trabajo', unit: 'bar' }, { key: 'efficiency', label: 'Eficiencia global', unit: '%' }],
    pressureLoss: [{ key: 'flow', label: 'Caudal', unit: 'L/min' }, { key: 'diameter', label: 'Diámetro interno', unit: 'mm' }, { key: 'length', label: 'Longitud', unit: 'm' }, { key: 'viscosity', label: 'Viscosidad', unit: 'cSt' }],
    oilTemp: [{ key: 'power', label: 'Potencia perdida', unit: 'kW' }, { key: 'ambient', label: 'Temperatura ambiente', unit: '°C' }, { key: 'tank', label: 'Volumen tanque', unit: 'L' }, { key: 'flow', label: 'Caudal', unit: 'L/min' }],
    air: [{ key: 'displacement', label: 'Cilindrada del motor', unit: '' }, { key: 'displacementUnit', label: 'Unidad de cilindrada', unit: '' }, { key: 'rpm', label: 'Máxima velocidad del motor', unit: 'rpm' }, { key: 'engineType', label: 'Tipo de motor / eficiencia volumétrica', unit: '' }, { key: 'specificEfficiency', label: 'Eficiencia volumétrica específica', unit: 'factor' }],
    airLube: [{ key: 'flow', label: 'Consumo de aire', unit: 'L/min' }, { key: 'ratio', label: 'Dosis base', unit: 'gotas/100 L' }],
    dewPoint: [{ key: 'air', label: 'Punto de rocío', unit: '°C' }, { key: 'ambient', label: 'Temperatura ambiente', unit: '°C' }, { key: 'pressure', label: 'Presión de línea', unit: 'bar' }],
    converter: [{ key: 'value', label: 'Valor a convertir', unit: '' }, { key: 'from', label: 'Unidad de origen', unit: '' }, { key: 'to', label: 'Unidad de destino', unit: '' }, { key: 'density', label: 'Densidad del lubricante', unit: 'kg/L' }],
    lubricationRoute: [{ key: 'points', label: 'Puntos de lubricación', unit: 'puntos' }, { key: 'minutes', label: 'Minutos por punto', unit: 'min' }, { key: 'frequency', label: 'Rondas por mes', unit: 'rondas' }],
    lubeCost: [{ key: 'tankCapacity', label: 'Capacidad del depósito', unit: 'L' }, { key: 'changesPerYear', label: 'Cambios por año', unit: 'cambios' }, { key: 'refillPerMonth', label: 'Relleno por fugas', unit: 'L/mes' }, { key: 'oilPrice', label: 'Precio del aceite', unit: 'USD/L' }, { key: 'filterCost', label: 'Costo de cada filtro', unit: 'USD' }, { key: 'hoursPerChange', label: 'Tiempo por cambio', unit: 'h' }, { key: 'laborRate', label: 'Costo hora mantenimiento', unit: 'USD/h' }, { key: 'disposalRate', label: 'Disposición ecológica', unit: 'USD/L' }, { key: 'labCost', label: 'Análisis de laboratorio anual', unit: 'USD/año' }],
    assetCriticality: [{ key: 'impact', label: 'Impacto del fallo', unit: '1–5' }, { key: 'frequency', label: 'Frecuencia', unit: '1–5' }, { key: 'detection', label: 'Dificultad detección', unit: '1–5' }],
    bearingLife: [{ key: 'dynamicLoad', label: 'Capacidad dinámica C', unit: 'kN' }, { key: 'equivalentLoad', label: 'Carga equivalente P', unit: 'kN' }, { key: 'rpm', label: 'Velocidad', unit: 'rpm' }, { key: 'reliability', label: 'Confiabilidad objetivo', unit: '%' }, { key: 'viscosityRatio', label: 'Relación de viscosidad κ', unit: 'x' }],
    chainSelection: [{ key: 'power', label: 'Potencia transmitida', unit: 'kW' }, { key: 'rpm', label: 'RPM motriz', unit: 'rpm' }, { key: 'drivenRpm', label: 'RPM conducida', unit: 'rpm' }, { key: 'serviceFactor', label: 'Factor de servicio', unit: 'x' }, { key: 'centerDistance', label: 'Distancia entre centros', unit: 'mm' }],
    oilAnalysis: [{ key: 'viscosityChange', label: 'Cambio de viscosidad', unit: '%' }, { key: 'water', label: 'Agua', unit: '%' }, { key: 'iron', label: 'Hierro', unit: 'ppm' }, { key: 'silicon', label: 'Silicio', unit: 'ppm' }, { key: 'hours', label: 'Horas de servicio', unit: 'h' }],
    greaseCoupling: [{ key: 'shaftDiameter', label: 'Diámetro de eje', unit: 'mm' }, { key: 'couplingDiameter', label: 'Diámetro del cople', unit: 'mm' }, { key: 'rpm', label: 'Velocidad', unit: 'rpm' }, { key: 'temperature', label: 'Temperatura', unit: '°C' }, { key: 'factor', label: 'Factor geométrico', unit: 'x' }],
    oilCorrection: [{ key: 'measuredViscosity', label: 'Viscosidad medida', unit: 'cSt' }, { key: 'measuredTemp', label: 'Temperatura medida', unit: '°C' }, { key: 'viscosityIndex', label: 'Índice de viscosidad (IV)', unit: 'VI' }, { key: 'operatingTemp', label: 'Temperatura operación', unit: '°C' }],
  }
  return <div className="fields-grid">{fields[id].filter((field) => field.key !== 'specificEfficiency' || values.engineType === 'specific').map((field) => <label className="input-label" key={field.key}><span>{field.label}</span><div className="input-wrap">{selectOptions[field.key] ? <select value={values[field.key] || selectOptions[field.key][0].value} onChange={(e) => update(field.key, e.target.value)}>{selectOptions[field.key].map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input inputMode={field.key === 'from' || field.key === 'to' ? 'text' : 'decimal'} value={values[field.key] || ''} onChange={(e) => update(field.key, e.target.value)} />}<em>{field.unit}</em></div></label>)}</div>
}
