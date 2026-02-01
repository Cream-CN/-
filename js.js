const fs = require('fs');

// ===================== 1. 常量与工具函数（复用，确保格式统一） =====================
const PI_100 = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679";
const E_100 = "2.7182818284590452353602874713526624977572470936999595749669676277240766303535475945713821785251664274";

/** 格式化为四位有效数字 */
function toFourSignificantDigits(num) {
    if (num === null || isNaN(num) || !isFinite(num)) return "无意义";
    if (num === 0) return "0.0000";
    const [significand, exponent] = num.toExponential().split('e');
    const exp = parseInt(exponent, 10);
    const fourSig = parseFloat(significand).toPrecision(4);
    const fullNum = parseFloat(`${fourSig}e${exp}`);
    if (fullNum >= 1000 || fullNum <= 0.001) return fullNum.toPrecision(4);
    const [intPart, decPart = ''] = fullNum.toString().split('.');
    const sigCount = intPart.replace(/^0+/, '').length;
    if (sigCount >= 4) return fullNum.toPrecision(4);
    if (intPart === '0') {
        const nonZeroIndex = decPart.indexOf(decPart.replace(/0+/, '')[0]);
        const finalDec = decPart.padEnd(nonZeroIndex + 4, '0').slice(0, nonZeroIndex + 4);
        return `0.${finalDec}`;
    }
    const decimalNeeded = 4 - sigCount;
    return fullNum.toFixed(Math.max(decimalNeeded, 0));
}

/** 度分转十进制角度（计算用） */
function degMinToDecimal(deg, min) {
    return deg + min / 60;
}

// ===================== 2. 三角函数类表格（独立拆分） =====================
/** 1. 正余弦表（sin + cos） */
function generateSinCosTable() {
    let rows = [];
    // 表头
    rows.push(`
        <tr style="background-color: #2c3e50; color: white; font-weight: bold; position: sticky; top: 0;">
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 60px;">度(°)</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">0~9'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">10~19'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">20~29'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">30~39'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">40~49'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">50~59'</</th>
        </tr>
    `);
    // 数据行（0°~359°，每度60分，10分一组）
    for (let deg = 0; deg < 360; deg++) {
        const rowCells = [`<td style="padding: 2px; border: 1px solid #000; text-align: center; font-weight: bold;">${deg}</td>`];
        for (let group = 0; group < 6; group++) {
            const cellContent = [];
            const startMin = group * 10;
            for (let min = startMin; min <= startMin + 9; min++) {
                const rad = degMinToDecimal(deg, min) * Math.PI / 180;
                const sin = toFourSignificantDigits(Math.sin(rad));
                const cos = toFourSignificantDigits(Math.cos(rad));
                cellContent.push(`
                    <div style="line-height: 1.1; font-size: 5.5pt;">
                        ${deg}°${min.toString().padStart(2, '0')}'<br>
                        sin:${sin} | cos:${cos}
                    </div>
                `);
            }
            rowCells.push(`
                <td style="padding: 1px; border: 1px solid #000; vertical-align: top;">
                    ${cellContent.join('<hr style="margin: 1px 0; border: none; border-top: 1px dashed #ccc;">')}
                </td>
            `);
        }
        const rowBg = deg % 2 === 0 ? "#ffffff" : "#f5f5f5";
        rows.push(`<tr style="background-color: ${rowBg}; height: auto;">${rowCells.join('')}</tr>`);
    }
    return `<table>${rows.join('')}</table>`;
}

/** 2. 正余切表（tan + cot） */
function generateTanCotTable() {
    let rows = [];
    rows.push(`
        <tr style="background-color: #e74c3c; color: white; font-weight: bold; position: sticky; top: 0;">
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 60px;">度(°)</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">0~9'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">10~19'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">20~29'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">30~39'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">40~49'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">50~59'</</th>
        </tr>
    `);
    for (let deg = 0; deg < 360; deg++) {
        const rowCells = [`<td style="padding: 2px; border: 1px solid #000; text-align: center; font-weight: bold;">${deg}</td>`];
        for (let group = 0; group < 6; group++) {
            const cellContent = [];
            const startMin = group * 10;
            for (let min = startMin; min <= startMin + 9; min++) {
                const rad = degMinToDecimal(deg, min) * Math.PI / 180;
                const tan = Math.abs(Math.tan(rad)) > 1e10 ? "无意义" : toFourSignificantDigits(Math.tan(rad));
                const cot = tan === "无意义" || Math.abs(Math.tan(rad)) < 1e-10 ? "无意义" : toFourSignificantDigits(1 / Math.tan(rad));
                cellContent.push(`
                    <div style="line-height: 1.1; font-size: 5.5pt;">
                        ${deg}°${min.toString().padStart(2, '0')}'<br>
                        tan:${tan} | cot:${cot}
                    </div>
                `);
            }
            rowCells.push(`
                <td style="padding: 1px; border: 1px solid #000; vertical-align: top;">
                    ${cellContent.join('<hr style="margin: 1px 0; border: none; border-top: 1px dashed #ccc;">')}
                </td>
            `);
        }
        const rowBg = deg % 2 === 0 ? "#ffffff" : "#f5f5f5";
        rows.push(`<tr style="background-color: ${rowBg}; height: auto;">${rowCells.join('')}</tr>`);
    }
    return `<table>${rows.join('')}</table>`;
}

/** 3. 正余割表（sec + csc） */
function generateSecCscTable() {
    let rows = [];
    rows.push(`
        <tr style="background-color: #f39c12; color: white; font-weight: bold; position: sticky; top: 0;">
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 60px;">度(°)</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">0~9'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">10~19'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">20~29'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">30~39'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">40~49'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">50~59'</</th>
        </tr>
    `);
    for (let deg = 0; deg < 360; deg++) {
        const rowCells = [`<td style="padding: 2px; border: 1px solid #000; text-align: center; font-weight: bold;">${deg}</td>`];
        for (let group = 0; group < 6; group++) {
            const cellContent = [];
            const startMin = group * 10;
            for (let min = startMin; min <= startMin + 9; min++) {
                const rad = degMinToDecimal(deg, min) * Math.PI / 180;
                const cos = Math.cos(rad);
                const sin = Math.sin(rad);
                const sec = Math.abs(cos) < 1e-10 ? "无意义" : toFourSignificantDigits(1 / cos);
                const csc = Math.abs(sin) < 1e-10 ? "无意义" : toFourSignificantDigits(1 / sin);
                cellContent.push(`
                    <div style="line-height: 1.1; font-size: 5.5pt;">
                        ${deg}°${min.toString().padStart(2, '0')}'<br>
                        sec:${sec} | csc:${csc}
                    </div>
                `);
            }
            rowCells.push(`
                <td style="padding: 1px; border: 1px solid #000; vertical-align: top;">
                    ${cellContent.join('<hr style="margin: 1px 0; border: none; border-top: 1px dashed #ccc;">')}
                </td>
            `);
        }
        const rowBg = deg % 2 === 0 ? "#ffffff" : "#f5f5f5";
        rows.push(`<tr style="background-color: ${rowBg}; height: auto;">${rowCells.join('')}</tr>`);
    }
    return `<table>${rows.join('')}</table>`;
}

// ===================== 3. 基础运算类表格（独立拆分） =====================
/** 4. 平方表 */
function generateSquareTable() {
    let rows = [];
    rows.push(`
        <tr style="background-color: #27ae60; color: white; font-weight: bold; position: sticky; top: 0;">
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 60px;">度(°)</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">0~9'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">10~19'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">20~29'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">30~39'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">40~49'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">50~59'</</th>
        </tr>
    `);
    for (let deg = 0; deg < 360; deg++) {
        const rowCells = [`<td style="padding: 2px; border: 1px solid #000; text-align: center; font-weight: bold;">${deg}</td>`];
        for (let group = 0; group < 6; group++) {
            const cellContent = [];
            const startMin = group * 10;
            for (let min = startMin; min <= startMin + 9; min++) {
                const num = degMinToDecimal(deg, min);
                const square = toFourSignificantDigits(num ** 2);
                cellContent.push(`
                    <div style="line-height: 1.1; font-size: 5.5pt;">
                        ${deg}°${min.toString().padStart(2, '0')}'(${num.toFixed(2)})<br>
                        平方:${square}
                    </div>
                `);
            }
            rowCells.push(`
                <td style="padding: 1px; border: 1px solid #000; vertical-align: top;">
                    ${cellContent.join('<hr style="margin: 1px 0; border: none; border-top: 1px dashed #ccc;">')}
                </td>
            `);
        }
        const rowBg = deg % 2 === 0 ? "#ffffff" : "#f5f5f5";
        rows.push(`<tr style="background-color: ${rowBg}; height: auto;">${rowCells.join('')}</tr>`);
    }
    return `<table>${rows.join('')}</table>`;
}

/** 5. 立方表 */
function generateCubeTable() {
    let rows = [];
    rows.push(`
        <tr style="background-color: #9b59b6; color: white; font-weight: bold; position: sticky; top: 0;">
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 60px;">度(°)</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">0~9'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">10~19'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">20~29'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">30~39'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">40~49'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">50~59'</</th>
        </tr>
    `);
    for (let deg = 0; deg < 360; deg++) {
        const rowCells = [`<td style="padding: 2px; border: 1px solid #000; text-align: center; font-weight: bold;">${deg}</td>`];
        for (let group = 0; group < 6; group++) {
            const cellContent = [];
            const startMin = group * 10;
            for (let min = startMin; min <= startMin + 9; min++) {
                const num = degMinToDecimal(deg, min);
                const cube = toFourSignificantDigits(num ** 3);
                cellContent.push(`
                    <div style="line-height: 1.1; font-size: 5.5pt;">
                        ${deg}°${min.toString().padStart(2, '0')}'(${num.toFixed(2)})<br>
                        立方:${cube}
                    </div>
                `);
            }
            rowCells.push(`
                <td style="padding: 1px; border: 1px solid #000; vertical-align: top;">
                    ${cellContent.join('<hr style="margin: 1px 0; border: none; border-top: 1px dashed #ccc;">')}
                </td>
            `);
        }
        const rowBg = deg % 2 === 0 ? "#ffffff" : "#f5f5f5";
        rows.push(`<tr style="background-color: ${rowBg}; height: auto;">${rowCells.join('')}</tr>`);
    }
    return `<table>${rows.join('')}</table>`;
}

/** 6. 平方根表 */
function generateSqrtTable() {
    let rows = [];
    rows.push(`
        <tr style="background-color: #3498db; color: white; font-weight: bold; position: sticky; top: 0;">
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 60px;">度(°)</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">0~9'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">10~19'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">20~29'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">30~39'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">40~49'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">50~59'</</th>
        </tr>
    `);
    for (let deg = 0; deg < 360; deg++) {
        const rowCells = [`<td style="padding: 2px; border: 1px solid #000; text-align: center; font-weight: bold;">${deg}</td>`];
        for (let group = 0; group < 6; group++) {
            const cellContent = [];
            const startMin = group * 10;
            for (let min = startMin; min <= startMin + 9; min++) {
                const num = degMinToDecimal(deg, min);
                const sqrt = num >= 0 ? toFourSignificantDigits(Math.sqrt(num)) : "无意义";
                cellContent.push(`
                    <div style="line-height: 1.1; font-size: 5.5pt;">
                        ${deg}°${min.toString().padStart(2, '0')}'(${num.toFixed(2)})<br>
                        平方根:${sqrt}
                    </div>
                `);
            }
            rowCells.push(`
                <td style="padding: 1px; border: 1px solid #000; vertical-align: top;">
                    ${cellContent.join('<hr style="margin: 1px 0; border: none; border-top: 1px dashed #ccc;">')}
                </td>
            `);
        }
        const rowBg = deg % 2 === 0 ? "#ffffff" : "#f5f5f5";
        rows.push(`<tr style="background-color: ${rowBg}; height: auto;">${rowCells.join('')}</tr>`);
    }
    return `<table>${rows.join('')}</table>`;
}

/** 7. 立方根表 */
function generateCbrtTable() {
    let rows = [];
    rows.push(`
        <tr style="background-color: #1abc9c; color: white; font-weight: bold; position: sticky; top: 0;">
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 60px;">度(°)</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">0~9'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">10~19'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">20~29'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">30~39'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">40~49'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">50~59'</</th>
        </tr>
    `);
    for (let deg = 0; deg < 360; deg++) {
        const rowCells = [`<td style="padding: 2px; border: 1px solid #000; text-align: center; font-weight: bold;">${deg}</td>`];
        for (let group = 0; group < 6; group++) {
            const cellContent = [];
            const startMin = group * 10;
            for (let min = startMin; min <= startMin + 9; min++) {
                const num = degMinToDecimal(deg, min);
                const cbrt = toFourSignificantDigits(Math.cbrt(num));
                cellContent.push(`
                    <div style="line-height: 1.1; font-size: 5.5pt;">
                        ${deg}°${min.toString().padStart(2, '0')}'(${num.toFixed(2)})<br>
                        立方根:${cbrt}
                    </div>
                `);
            }
            rowCells.push(`
                <td style="padding: 1px; border: 1px solid #000; vertical-align: top;">
                    ${cellContent.join('<hr style="margin: 1px 0; border: none; border-top: 1px dashed #ccc;">')}
                </td>
            `);
        }
        const rowBg = deg % 2 === 0 ? "#ffffff" : "#f5f5f5";
        rows.push(`<tr style="background-color: ${rowBg}; height: auto;">${rowCells.join('')}</tr>`);
    }
    return `<table>${rows.join('')}</table>`;
}

// ===================== 4. 对数类表格（独立拆分） =====================
/** 8. 常用对数表（lg） */
function generateLgTable() {
    let rows = [];
    rows.push(`
        <tr style="background-color: #e67e22; color: white; font-weight: bold; position: sticky; top: 0;">
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 60px;">度(°)</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">0~9'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">10~19'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">20~29'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">30~39'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">40~49'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">50~59'</</th>
        </tr>
    `);
    for (let deg = 0; deg < 360; deg++) {
        const rowCells = [`<td style="padding: 2px; border: 1px solid #000; text-align: center; font-weight: bold;">${deg}</td>`];
        for (let group = 0; group < 6; group++) {
            const cellContent = [];
            const startMin = group * 10;
            for (let min = startMin; min <= startMin + 9; min++) {
                const num = degMinToDecimal(deg, min);
                const lg = num > 0 ? toFourSignificantDigits(Math.log10(num)) : "无意义";
                cellContent.push(`
                    <div style="line-height: 1.1; font-size: 5.5pt;">
                        ${deg}°${min.toString().padStart(2, '0')}'(${num.toFixed(2)})<br>
                        lg(常用对数):${lg}
                    </div>
                `);
            }
            rowCells.push(`
                <td style="padding: 1px; border: 1px solid #000; vertical-align: top;">
                    ${cellContent.join('<hr style="margin: 1px 0; border: none; border-top: 1px dashed #ccc;">')}
                </td>
            `);
        }
        const rowBg = deg % 2 === 0 ? "#ffffff" : "#f5f5f5";
        rows.push(`<tr style="background-color: ${rowBg}; height: auto;">${rowCells.join('')}</tr>`);
    }
    return `<table>${rows.join('')}</table>`;
}

/** 9. 自然对数表（ln） */
function generateLnTable() {
    let rows = [];
    rows.push(`
        <tr style="background-color: #34495e; color: white; font-weight: bold; position: sticky; top: 0;">
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 60px;">度(°)</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">0~9'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">10~19'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">20~29'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">30~39'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">40~49'</</th>
            <<th style="padding: 3px; border: 1px solid #000; text-align: center; width: 150px;">50~59'</</th>
        </tr>
    `);
    for (let deg = 0; deg < 360; deg++) {
        const rowCells = [`<td style="padding: 2px; border: 1px solid #000; text-align: center; font-weight: bold;">${deg}</td>`];
        for (let group = 0; group < 6; group++) {
            const cellContent = [];
            const startMin = group * 10;
            for (let min = startMin; min <= startMin + 9; min++) {
                const num = degMinToDecimal(deg, min);
                const ln = num > 0 ? toFourSignificantDigits(Math.log(num)) : "无意义";
                cellContent.push(`
                    <div style="line-height: 1.1; font-size: 5.5pt;">
                        ${deg}°${min.toString().padStart(2, '0')}'(${num.toFixed(2)})<br>
                        ln(自然对数):${ln}
                    </div>
                `);
            }
            rowCells.push(`
                <td style="padding: 1px; border: 1px solid #000; vertical-align: top;">
                    ${cellContent.join('<hr style="margin: 1px 0; border: none; border-top: 1px dashed #ccc;">')}
                </td>
            `);
        }
        const rowBg = deg % 2 === 0 ? "#ffffff" : "#f5f5f5";
        rows.push(`<tr style="background-color: ${rowBg}; height: auto;">${rowCells.join('')}</tr>`);
    }
    return `<table>${rows.join('')}</table>`;
}

// ===================== 5. 整合所有独立表格生成HTML =====================
function generateSplitHTML() {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>360°周期独立数学表（步长1分 + 四位有效数字）</title>
    <style>
        body {
            font-family: "SimSun", 宋体, serif;
            font-size: 12pt;
            margin: 0.3cm;
        }
        h1 {
            text-align: center;
            color: #000;
            margin: 8px 0;
            font-weight: bold;
            font-size: 13pt;
        }
        h2 {
            text-align: center;
            color: #000;
            margin: 10px 0 5px;
            font-weight: bold;
            font-size: 11pt;
            border-bottom: 1px solid #ddd;
            padding-bottom: 2px;
        }
        .const-section {
            margin: 8px 0;
            padding: 6px;
            border: 1px solid #ddd;
        }
        .const-label {
            font-size: 9pt;
            font-weight: bold;
            margin-bottom: 3px;
            display: block;
        }
        .const-content {
            font-family: "Consolas", "Courier New", monospace;
            font-size: 8pt;
            white-space: pre-wrap;
            line-height: 1.2;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            page-break-inside: avoid;
            table-layout: fixed;
            margin: 5px 0 15px;
        }
        thead {
            display: table-header-group;
        }
        .table-hint {
            text-align: center;
            font-size: 7pt;
            color: #666;
            margin: 2px 0 8px;
        }
        @media print {
            @page {
                size: A4 landscape;
                margin: 0.3cm;
            }
            body {
                margin: 0;
            }
            hr {
                display: none;
            }
        }
    </style>
</head>
<body>
    <h1>数学常数（100位精度）+ 360°周期独立数学表（步长1分）</h1>

    <!-- 数学常数 -->
    <div class="const-section">
        <span class="const-label">π（圆周率）：</span>
        <div class="const-content">${PI_100}</div>
    </div>
    <div class="const-section">
        <span class="const-label">e（自然常数）：</span>
        <div class="const-content">${E_100}</div>
    </div>

    <!-- 1. 正余弦表 -->
    <h2>一、正余弦表（sin + cos）</h2>
    <p class="table-hint">范围：0°00'~359°59' | 步长：1分 | 格式：四位有效数字 | 无意义项标注"无意义"</p>
    ${generateSinCosTable()}

    <!-- 2. 正余切表 -->
    <h2>二、正余切表（tan + cot）</h2>
    <p class="table-hint">范围：0°00'~359°59' | 步长：1分 | 格式：四位有效数字 | 无意义项标注"无意义"</p>
    ${generateTanCotTable()}

    <!-- 3. 正余割表 -->
    <h2>三、正余割表（sec + csc）</h2>
    <p class="table-hint">范围：0°00'~359°59' | 步长：1分 | 格式：四位有效数字 | 无意义项标注"无意义"</p>
    ${generateSecCscTable()}

    <!-- 4. 平方表 -->
    <h2>四、平方表</h2>
    <p class="table-hint">输入：0°00'~359°59'（十进制角度） | 步长：1分 | 格式：四位有效数字</p>
    ${generateSquareTable()}

    <!-- 5. 立方表 -->
    <h2>五、立方表</h2>
    <p class="table-hint">输入：0°00'~359°59'（十进制角度） | 步长：1分 | 格式：四位有效数字</p>
    ${generateCubeTable()}

    <!-- 6. 平方根表 -->
    <h2>六、平方根表</h2>
    <p class="table-hint">输入：0°00'~359°59'（十进制角度） | 步长：1分 | 格式：四位有效数字 | 负数标注"无意义"</p>
    ${generateSqrtTable()}

    <!-- 7. 立方根表 -->
    <h2>七、立方根表</h2>
    <p class="table-hint">输入：0°00'~359°59'（十进制角度） | 步长：1分 | 格式：四位有效数字</p>
    ${generateCbrtTable()}

    <!-- 8. 常用对数表（lg） -->
    <h2>八、常用对数表（lg）</h2>
    <p class="table-hint">输入：0°00'~359°59'（十进制角度） | 步长：1分 | 格式：四位有效数字 | ≤0标注"无意义"</p>
    ${generateLgTable()}

    <!-- 9. 自然对数表（ln） -->
    <h2>九、自然对数表（ln）</h2>
    <p class="table-hint">输入：0°00'~359°59'（十进制角度） | 步长：1分 | 格式：四位有效数字 | ≤0标注"无意义"</p>
    ${generateLnTable()}

    <div style="margin: 10px 0; text-align: center; font-size: 8pt; color: #666;">
        打印说明：所有表格支持A4横向打印，缩放比例建议50%-60%；表头粘性显示，隔行变色提升可读性；兼容Word/Excel导入
    </div>
</body>
</html>
    `;
}

// ===================== 6. 主执行逻辑 =====================
(function main() {
    try {
        console.log("===== 开始生成360°周期独立数学表（9个表格+步长1分）=====");
        console.log("⚠️ 数据量较大（每个表格21600个数据点），生成时间约5~8分钟，请耐心等待...");
        
        const htmlContent = generateSplitHTML();
        const outputFile = "360deg_1min_split_math_tables.html";
        fs.writeFileSync(outputFile, htmlContent, 'utf8');

        console.log(`\n🎉 生成完成！结果已写入 ${outputFile} 文件`);
        console.log("✅ 包含9个独立表格：正余弦+正余切+正余割+平方+立方+平方根+立方根+lg+ln");
        console.log("✅ 核心参数：360°完整周期 | 步长1分 | 四位有效数字 | A4横向适配");
        console.log("✅ 打开建议：用Chrome/Word打开，打印时缩放50%，单独打印某类表格更高效");
    } catch (error) {
        console.error("❌ 执行出错：", error.message);
    }
})();