// --- CÁC HÀM CẬP NHẬT GIAO DIỆN NHẬP LIỆU ---
function findDataByDegree(degree) {
    let normalizedDegree = parseFloat(degree);
    if (isNaN(normalizedDegree)) return null;
    while (normalizedDegree >= 360) normalizedDegree -= 360;
    while (normalizedDegree < 0) normalizedDegree += 360;
    if (normalizedDegree === 360) normalizedDegree = 0;

    const findInRange = (data) => data.find(d => {
        if (d.from > d.to) { return normalizedDegree >= d.from || normalizedDegree < d.to; }
        return normalizedDegree >= d.from && normalizedDegree < d.to;
    });
    
    const detail = findInRange(huyenKhongData_DegreeMap);
    if (!detail) return null;
    return { phuong: findInRange(phuongData)?.name || 'N/A', huong: findInRange(huongData)?.name || 'N/A', son: findInRange(sonData)?.name || 'N/A', canChi: detail.canChi };
}
function getHanhFromCanChi(canChi) { if (!canChi || !hoaGiapData[canChi]) return []; return hoaGiapData[canChi].map(item => item.h); }
function getVanFromCanChi(canChi) { if (!canChi || !hoaGiapData[canChi]) return []; return hoaGiapData[canChi].map(item => item.v); }
function formatHccvAndQue(canChi) {
    if (!canChi || !hoaGiapData[canChi]) return 'N/A\nN/A';
    const hccvData = hoaGiapData[canChi];
    const queDataFromMap = huyenKhongQueMap[canChi] || ['N/A'];
    const results = [];
    for (let i = 0; i < hccvData.length; i++) {
        const item = hccvData[i];
        const queName = queDataFromMap[i] || queDataFromMap[0];
        const hccvString = `${item.h} - ${canChi.replace(' ','-')} - ${item.v}`;
        const quanHeStrings = quanHeQueData[queName];
        let finalString = `${hccvString}\n${queName}`;
        if (quanHeStrings && quanHeStrings.length > 0) finalString += '\n' + quanHeStrings.join('\n');
        results.push(finalString);
    }
    return results.join('\n-----\n');
}

function updateInfoBox(infoDiv, canChi, isToa = false, phamInfo = null) {
    const formattedString = formatHccvAndQue(canChi);
    const parts = formattedString.split('\n-----\n');
    const mainInfo = parts[0].split('\n');
    const hccv = mainInfo[0] || 'N/A';
    const que = mainInfo[1] || 'N/A';

    let html = '<table>';
    if(isToa) {
        html += '<tr><td colspan="2" style="text-align: center; font-weight: bold; background-color: #f2f2f2;">HKĐQ</td></tr>';
        const toaInfo = findDataByDegree(document.getElementById('toa-do').value);
        if(toaInfo) {
            html += `<tr><td>Phương:</td><td>${toaInfo.phuong}</td></tr>`;
            html += `<tr><td>Hướng:</td><td>${toaInfo.huong}</td></tr>`;
            html += `<tr><td>Sơn:</td><td>${toaInfo.son}</td></tr>`;
        }
    }
    html += `<tr><td>Can Chi:</td><td>${canChi}</td></tr>`;
    if(LUC_THAP_NAP_AM_MAP[canChi] && !isToa) { html += `<tr><td>Nạp Âm:</td><td>${LAC_THU_NAP_AM_MAP[canChi]}<br><small>(${LUC_THAP_NAP_AM_MAP[canChi]})</small></td></tr>`; }
    if (parts.length > 1) {
        const secondInfo = parts[1].split('\n');
        const hccv2 = secondInfo[0] || 'N/A', que2 = secondInfo[1] || 'N/A';
        html += `<tr><td>Quẻ:</td><td>${que}<br/>${que2}</td></tr>`;
        html += `<tr><td>H-C-C-V:</td><td>${hccv}<br/>${hccv2}</td></tr>`;
    } else {
        html += `<tr><td>Quẻ:</td><td>${que}</td></tr>`;
        html += `<tr><td>H-C-C-V:</td><td>${hccv}</td></tr>`;
    }
    if(isToa && phamInfo) html += `<tr><td>Phạm:</td><td class="toa-do-pham-cell ${phamInfo.class}">${phamInfo.text}</td></tr>`;
    html += '</table>';
    infoDiv.innerHTML = html;
}

function updateTuoiXemInfo() {
    const year = document.getElementById('birth-year').value;
    const infoDiv = document.getElementById('birth-year-info');
    if (!year || isNaN(year)) { infoDiv.innerHTML = ''; return; }
    const yearInfo = getYearCanChiInfo(parseInt(year));
    updateInfoBox(infoDiv, yearInfo.canChi, false);
}

function updateToaDoInfo() {
    const degree = document.getElementById('toa-do').value;
    const infoDiv = document.getElementById('toa-do-info');
    if (degree === '' || isNaN(parseFloat(degree))) { infoDiv.innerHTML = ''; return; }
    const toaInfo = findDataByDegree(degree);
    if (!toaInfo) { infoDiv.innerHTML = '<table><tr><td colspan="2" style="color:red; font-weight:bold;">Không có dữ liệu cho độ số này.</td></tr></table>'; return; }
    const viewYear = document.getElementById('view-year').value;
    let phamInfo = null;
    if (viewYear && !isNaN(viewYear)) {
        const satsInfo = calculateAllYearlySats(parseInt(viewYear));
        if (satsInfo) {
            const toaHuong = toaInfo.huong, toaHuongPalace = huongToPalaceNameMap[toaHuong], toaSon = toaInfo.son;
            const phamList = new Set();
            const yearChi = satsInfo.yearChi;
            const nguHoangNamPalace = satsInfo.nguHoangNam, oppositeNguHoangPalace = palaceOpposites[nguHoangNamPalace];
            if (toaHuongPalace === nguHoangNamPalace || toaHuongPalace === oppositeNguHoangPalace) phamList.add("Trục Ngũ Hoàng");
            const batSatHuongCuaNam = BAT_SAT_NAM_CHI_MAP[yearChi];
            if (batSatHuongCuaNam && toaHuong === batSatHuongCuaNam) phamList.add("Bát Sát");
            if (satsInfo.thaiTue.split(' - ').includes(toaSon)) phamList.add('Thái Tuế');
            if (satsInfo.tuePha.split(' - ').includes(toaSon)) phamList.add('Xung Thái Tuế');
            const allTamSatSons = getTamSatSonsForYear(yearChi);
            if (allTamSatSons.includes(toaSon)) phamList.add("Tam Sát");
            if (phamList.size > 0) phamInfo = { text: `(${[...phamList].join(', ')})`, class: '' };
            else phamInfo = { text: 'KHÔNG PHẠM', class: 'khong-pham' };
        }
    }
    updateInfoBox(infoDiv, toaInfo.canChi, true, phamInfo);
}

function updateNamXemInfo() {
    const year = document.getElementById('view-year').value;
    const infoDiv = document.getElementById('view-year-info');
    if (!year || isNaN(year)) { infoDiv.innerHTML = ''; return; }
    const yearNum = parseInt(year);
    const yearInfo = getYearCanChiInfo(yearNum);
    const satsInfo = calculateAllYearlySats(yearNum);
    if (!satsInfo) { infoDiv.innerHTML = 'Năm không hợp lệ.'; return; }
    
    let html = '';
    const infoContainer = document.createElement('div');
    updateInfoBox(infoContainer, yearInfo.canChi, false);
    html += infoContainer.innerHTML.replace('</table>','');

    const nguHoangSon = palaceToSonMap[satsInfo.nguHoangNam] || [], nhiHacSon = palaceToSonMap[satsInfo.nhiHacNam] || [];
    html += `<tr><td>Ngũ Hoàng (Năm):</td><td class="highlight-5">${satsInfo.nguHoangNam} (${nguHoangSon.join(', ')})</td></tr>`;
    html += `<tr><td>Nhị Hắc (Năm):</td><td class="highlight-2">${satsInfo.nhiHacNam} (${nhiHacSon.join(', ')})</td></tr>`;
    html += `<tr><td>Thái Tuế:</td><td>${satsInfo.thaiTue}</td></tr>`;
    html += `<tr><td>Xung Thái Tuế:</td><td>${satsInfo.tuePha}</td></tr>`;
    html += `<tr><td style="white-space: normal;">Tam Sát (Năm):</td><td style="white-space: normal; text-align: left; padding: 4px;">${getDetailedTamSatInfo(satsInfo.yearChi)}</td></tr>`;
    html += `<tr><td>Bát Sát (Năm):</td><td id="info-batsat-nam">${BAT_SAT_NAM_CHI_MAP[satsInfo.yearChi] || 'Không có'}</td></tr>`;
    
    let tableMonthly = `<tr><td colspan="2"><table class="sub-table"><tr><th>Tháng</th>`;
    for(let i=1; i<=12; i++) tableMonthly += `<th>${i}</th>`;
    tableMonthly += `</tr><tr><td>Ngũ Hoàng</td>`;
    for(let i=1; i<=12; i++) { const p = satsInfo.monthlyStars[i].nguHoang; const s = palaceToSonMap[p] || []; tableMonthly += `<td class="highlight-5">${p}<br><small>(${s.join(',')})</small></td>`; }
    tableMonthly += `</tr><tr><td>Nhị Hắc</td>`;
    for(let i=1; i<=12; i++) { const p = satsInfo.monthlyStars[i].nhiHac; const s = palaceToSonMap[p] || []; tableMonthly += `<td class="highlight-2">${p}<br><small>(${s.join(',')})</small></td>`; }
    tableMonthly += `</tr></table></td></tr></table>`;
    html += tableMonthly;
    infoDiv.innerHTML = html;
}

function updateSummaryTable() {
    document.querySelectorAll('#summary-table tbody td[id]:not([id^="thbl-"])').forEach(td => td.innerText = '');
    const toaDo = document.getElementById('toa-do').value, viewYear = document.getElementById('view-year').value, birthYear = document.getElementById('birth-year').value;
    if (!toaDo || !viewYear || !birthYear) return;
    const toaInfo = findDataByDegree(toaDo), satsInfo = calculateAllYearlySats(parseInt(viewYear)), birthInfo = getYearCanChiInfo(parseInt(birthYear));
    if (!toaInfo || !satsInfo || !birthInfo) return;

    const setCell = (id, text) => { const cell = document.getElementById(id); if (cell) cell.innerText = Array.isArray(text) ? text.join(', ') : text || ''; };
    const avoid = { thangChi: new Set(), ngayCan: new Set(), ngayChi: new Set(), gioCan: new Set(), gioChi: new Set() };
    const choose = { thangChi: new Set(), ngayCan: new Set(), ngayChi: new Set(), gioCan: new Set(), gioChi: new Set() };

    const namChiAvoidNguHoang = (palaceToSonMap[satsInfo.nguHoangNam] || []).filter(s => DIA_CHI.includes(s));
    setCell('tranh-nguhoang-nam-chi', [...new Set(namChiAvoidNguHoang)]);
    
    const huongPalaceName = huongToPalaceNameMap[toaInfo.huong];
    if (huongPalaceName) {
        const oppositeHuongPalace = palaceOpposites[huongPalaceName];
        const palacesToAvoidForMonthNguHoang = [huongPalaceName, oppositeHuongPalace].filter(Boolean);
        const thangChiAvoidNguHoang = new Set();
        for (let m = 1; m <= 12; m++) if (palacesToAvoidForMonthNguHoang.includes(satsInfo.monthlyStars[m].nguHoang)) thangChiAvoidNguHoang.add(tietKhiMonthChi[m - 1]);
        [...thangChiAvoidNguHoang].forEach(c => avoid.thangChi.add(c));
        setCell('tranh-nguhoang-thang-chi', [...thangChiAvoidNguHoang]);
    }
    
    const tuePhaChi = satsInfo.tuePha.split(' - ')[1];
    if (tuePhaChi) { avoid.thangChi.add(tuePhaChi); avoid.ngayChi.add(tuePhaChi); avoid.gioChi.add(tuePhaChi); }
    ['nam','thang','ngay','gio'].forEach(tf => setCell(`tranh-tuepha-${tf}-chi`, tuePhaChi));
    
    const tamSatPhuongMap = { 'NAM': ['Thân', 'Tý', 'Thìn'], 'BẮC': ['Dần', 'Ngọ', 'Tuất'], 'TÂY': ['Hợi', 'Mão', 'Mùi'], 'ĐÔNG': ['Tị', 'Dậu', 'Sửu'] };
    const tamSatChi = (toaInfo.phuong && tamSatPhuongMap[toaInfo.phuong]) ? tamSatPhuongMap[toaInfo.phuong] : [];
    if (tamSatChi.length > 0) {
        tamSatChi.forEach(c => { avoid.thangChi.add(c); avoid.ngayChi.add(c); avoid.gioChi.add(c); });
        ['nam','thang','ngay','gio'].forEach(tf => setCell(`tranh-tamsat-${tf}-chi`, tamSatChi));
    }

    const batSatChi = BAT_SAT_HUONG_MAP[toaInfo.huong] || '';
    if(batSatChi){ avoid.thangChi.add(batSatChi); avoid.ngayChi.add(batSatChi); avoid.gioChi.add(batSatChi); }
    ['nam','thang','ngay','gio'].forEach(tf => setCell(`tranh-batsat-${tf}-chi`, batSatChi));
    
    const xungToaChi = LUC_XUNG_MAP[toaInfo.canChi ? toaInfo.canChi.split(' ')[1] : ''] || ''; 
    if (xungToaChi) { avoid.thangChi.add(xungToaChi); avoid.ngayChi.add(xungToaChi); avoid.gioChi.add(xungToaChi); }
    ['nam','thang','ngay','gio'].forEach(tf => setCell(`tranh-xungtoa-${tf}-chi`, xungToaChi));

    const xungTuoiChi = LUC_XUNG_MAP[birthInfo.canChi ? birthInfo.canChi.split(' ')[1] : ''] || '';
    if (xungTuoiChi) { avoid.thangChi.add(xungTuoiChi); avoid.ngayChi.add(xungTuoiChi); avoid.gioChi.add(xungTuoiChi); }
    ['nam','thang','ngay','gio'].forEach(tf => setCell(`tranh-xungtuoi-${tf}-chi`, xungTuoiChi));
    
    const phuong = toaInfo.phuong;
    const tuHopMap = { 'ĐÔNG': {can: ['Giáp', 'Ất'], chi: ['Dần', 'Mão', 'Thìn']}, 'TÂY': {can: ['Canh', 'Tân'], chi: ['Thân', 'Dậu', 'Tuất']}, 'NAM': {can: ['Bính', 'Đinh'], chi: ['Tị', 'Ngọ', 'Mùi']}, 'BẮC': {can: ['Nhâm', 'Quý'], chi: ['Hợi', 'Tý', 'Sửu']} };
    const sinhHopMap = { 'ĐÔNG': {can: ['Nhâm', 'Quý'], chi: ['Hợi', 'Tý', 'Sửu']}, 'TÂY': {can: ['Mậu', 'Kỷ'], chi: ['Thìn', 'Tuất', 'Sửu', 'Mùi']}, 'NAM': {can: ['Giáp', 'Ất'], chi: ['Dần', 'Mão', 'Thìn']}, 'BẮC': {can: ['Canh', 'Tân'], chi: ['Thân', 'Dậu', 'Tuất']} };
    const tamHopMap = { 'ĐÔNG': ['Hợi', 'Mão', 'Mùi'], 'TÂY': ['Tị', 'Dậu', 'Sửu'], 'NAM': ['Dần', 'Ngọ', 'Tuất'], 'BẮC': ['Thân', 'Tý', 'Thìn'] };

    if (phuong) {
        const tuHop = tuHopMap[phuong] || {can:[], chi:[]};
        tuHop.can.forEach(c => {choose.ngayCan.add(c); choose.gioCan.add(c);});
        tuHop.chi.forEach(c => {choose.thangChi.add(c); choose.ngayChi.add(c); choose.gioChi.add(c);});
        setCell('chon-tuhop-thang-chi', tuHop.chi); setCell('chon-tuhop-ngay-can', tuHop.can); setCell('chon-tuhop-ngay-chi', tuHop.chi); setCell('chon-tuhop-gio-can', tuHop.can); setCell('chon-tuhop-gio-chi', tuHop.chi);

        const sinhHop = sinhHopMap[phuong] || {can:[], chi:[]};
        sinhHop.can.forEach(c => {choose.ngayCan.add(c); choose.gioCan.add(c);});
        sinhHop.chi.forEach(c => {choose.thangChi.add(c); choose.ngayChi.add(c); choose.gioChi.add(c);});
        setCell('chon-sinhhop-thang-chi', sinhHop.chi); setCell('chon-sinhhop-ngay-can', sinhHop.can); setCell('chon-sinhhop-ngay-chi', sinhHop.chi); setCell('chon-sinhhop-gio-can', sinhHop.can); setCell('chon-sinhhop-gio-chi', sinhHop.chi);
        
        const tamHop = tamHopMap[phuong] || [];
        tamHop.forEach(c => {choose.thangChi.add(c); choose.ngayChi.add(c); choose.gioChi.add(c);});
        setCell('chon-tamhop-thang-chi', tamHop); setCell('chon-tamhop-ngay-chi', tamHop); setCell('chon-tamhop-gio-chi', tamHop);
    }
    
    if (toaInfo.huong && toaInfo.huong !== 'N/A') {
        const canBoLong = tamHopBoLongCanMap[toaInfo.huong];
        if(canBoLong) { choose.ngayCan.add(canBoLong); choose.gioCan.add(canBoLong); }
        new Set([...(tamHopBoLongChiMap['Ấn Cục'][toaInfo.huong]||[]), ...(tamHopBoLongChiMap['Tài Cục'][toaInfo.huong]||[]), ...(tamHopBoLongChiMap['Vượng Cục'][toaInfo.huong]||[])]).forEach(c => { choose.thangChi.add(c); choose.ngayChi.add(c); choose.gioChi.add(c); });
    }

    setCell('ketluan-tranh-thang-chi', [...avoid.thangChi]); setCell('ketluan-tranh-ngay-can', [...avoid.ngayCan]); setCell('ketluan-tranh-ngay-chi', [...avoid.ngayChi]); setCell('ketluan-tranh-gio-can', [...avoid.gioCan]); setCell('ketluan-tranh-gio-chi', [...avoid.gioChi]);
    setCell('ketluan-chon-thang-chi', [...new Set(choose.thangChi)].filter(c => !avoid.thangChi.has(c))); setCell('ketluan-chon-ngay-can', [...new Set(choose.ngayCan)].filter(c => !avoid.ngayCan.has(c))); setCell('ketluan-chon-ngay-chi', [...new Set(choose.ngayChi)].filter(c => !avoid.ngayChi.has(c))); setCell('ketluan-chon-gio-can', [...new Set(choose.gioCan)].filter(c => !avoid.gioCan.has(c))); setCell('ketluan-chon-gio-chi', [...new Set(choose.gioChi)].filter(c => !avoid.gioChi.has(c)));
}

function updateTamHopBoLongTable() {
    document.querySelectorAll('[id^="thbl-"]').forEach(cell => cell.innerText = '');
    const toaDo = document.getElementById('toa-do').value;
    const toaInfo = toaDo ? findDataByDegree(toaDo) : null;
    if (!toaInfo || !toaInfo.huong || toaInfo.huong === 'N/A') return; 

    const huong = toaInfo.huong;
    const canValue = tamHopBoLongCanMap[huong] || '';
    const chiAnValue = (tamHopBoLongChiMap['Ấn Cục'][huong] || []).join(', ');
    const chiTaiValue = (tamHopBoLongChiMap['Tài Cục'][huong] || []).join(', ');
    const chiVuongValue = (tamHopBoLongChiMap['Vượng Cục'][huong] || []).join(', ');
    
    ['nam', 'thang', 'ngay', 'gio'].forEach(tf => {
        if (tf === 'ngay' || tf === 'gio') {
            document.getElementById(`thbl-ancuc-${tf}-can`).innerText = canValue; document.getElementById(`thbl-taicuc-${tf}-can`).innerText = canValue; document.getElementById(`thbl-vuongcuc-${tf}-can`).innerText = canValue;
        }
        if (tf !== 'nam') { 
            document.getElementById(`thbl-ancuc-${tf}-chi`).innerText = chiAnValue || '-'; document.getElementById(`thbl-taicuc-${tf}-chi`).innerText = chiTaiValue || '-'; document.getElementById(`thbl-vuongcuc-${tf}-chi`).innerText = chiVuongValue || '-';
        }
    });
}

function updateThaiDuongAmTable() {
    const toaDo = document.getElementById('toa-do').value;
    const toaInfo = toaDo ? findDataByDegree(toaDo) : null;
    const cells = { sonValue: document.getElementById('tdta-son-value'), tdDaoToa: document.getElementById('tdta-td-daotoa-data'), tdDaoHuong: document.getElementById('tdta-td-daohuong-data'), tdDaoTamHop: document.getElementById('tdta-td-daotamhob-data'), taDaoToa: document.getElementById('tdta-ta-daotoa-data'), taDaoHuong: document.getElementById('tdta-ta-daohuong-data') };
    Object.values(cells).forEach(cell => cell.innerText = '');
    const tietKhiHighlightSet = new Set();
    if (!toaInfo || !toaInfo.son || toaInfo.son === 'N/A') { cells.sonValue.innerText = 'N/A'; return { son: null, tietKhiSet: tietKhiHighlightSet }; }
    
    const son = toaInfo.son, data = THAI_DUONG_AM_DATA[son];
    cells.sonValue.innerText = son;
    if (data) {
        cells.tdDaoToa.innerText = data.tdDaoToa || '-'; cells.tdDaoHuong.innerText = data.tdDaoHuong || '-'; cells.tdDaoTamHop.innerText = data.tdDaoTamHop || '-'; cells.taDaoToa.innerText = data.taDaoToa || '-'; cells.taDaoHuong.innerText = data.taDaoHuong || '-';
        [data.tdDaoToa, data.tdDaoHuong, data.taDaoToa, data.taDaoHuong].forEach(tk => { if (tk) tietKhiHighlightSet.add(tk); });
        (data.tdDaoTamHop || '').split('\n').forEach(line => { const tk = line.split(' đáo ')[0]; if(tk && TIET_KHI.includes(tk)) tietKhiHighlightSet.add(tk); });
    }
    return { son: son, tietKhiSet: tietKhiHighlightSet };
}

function solveToiUu() {
    const resultsDiv = document.getElementById('toi-uu-results'); resultsDiv.innerHTML = '';
    const birthYear = document.getElementById('birth-year').value, toaDo = document.getElementById('toa-do').value;
    const tuoiCanChi = birthYear ? getYearCanChiInfo(parseInt(birthYear)).canChi : null, toaInfo = toaDo ? findDataByDegree(toaDo) : null, toaCanChi = toaInfo ? toaInfo.canChi : null;
    const hanhTuoiArr = tuoiCanChi ? getHanhFromCanChi(tuoiCanChi) : [], hanhToaArr = toaCanChi ? getHanhFromCanChi(toaCanChi) : [];
    const hasTuoi = hanhTuoiArr.length > 0, hasToa = hanhToaArr.length > 0;
    if (!hasTuoi && !hasToa) { resultsDiv.innerHTML = 'Vui lòng nhập Tuổi hoặc Tọa để tính tối ưu Hành.'; return new Map(); }

    const optimalHanhNgay = new Map();
    for (let h_ngay = 1; h_ngay <= 9; h_ngay++) {
        let allReasons = [];
        if (hasTuoi && hasToa) {
            for (const h_tuoi of hanhTuoiArr) for (const h_toa of hanhToaArr) {
                const rel_toa_tuoi = [...checkHanhRelations(h_tuoi, h_toa), ...checkDirectedRelations(h_tuoi, h_toa)];
                if (rel_toa_tuoi.length > 0) {
                    const rel_ngay_toa = [...checkHanhRelations(h_toa, h_ngay), ...checkDirectedRelations(h_toa, h_ngay)], rel_ngay_tuoi = [...checkHanhRelations(h_tuoi, h_ngay), ...checkDirectedRelations(h_tuoi, h_ngay)];
                    if (rel_ngay_toa.length > 0 && rel_ngay_tuoi.length > 0) {
                        const reason = `Tọa(${h_toa}) - Tuổi(${h_tuoi}): ${rel_toa_tuoi.join(', ')}\nNgày(${h_ngay}) - Tọa(${h_toa}): ${rel_ngay_toa.join(', ')}\nNgày(${h_ngay}) - Tuổi(${h_tuoi}): ${rel_ngay_tuoi.join(', ')}`;
                        if (!allReasons.includes(reason)) allReasons.push(reason);
                    }
                }
            }
        } else if (hasTuoi) {
            for (const h_tuoi of hanhTuoiArr) {
                const rel_ngay_tuoi = [...checkHanhRelations(h_tuoi, h_ngay), ...checkDirectedRelations(h_tuoi, h_ngay)];
                if (rel_ngay_tuoi.length > 0) { const reason = `Ngày(${h_ngay}) - Tuổi(${h_tuoi}): ${rel_ngay_tuoi.join(', ')}`; if (!allReasons.includes(reason)) allReasons.push(reason); }
            }
        } else if (hasToa) {
            for (const h_toa of hanhToaArr) {
                const rel_ngay_toa = [...checkHanhRelations(h_toa, h_ngay), ...checkDirectedRelations(h_toa, h_ngay)];
                if (rel_ngay_toa.length > 0) { const reason = `Ngày(${h_ngay}) - Tọa(${h_toa}): ${rel_ngay_toa.join(', ')}`; if (!allReasons.includes(reason)) allReasons.push(reason); }
            }
        }
        if (allReasons.length > 0) optimalHanhNgay.set(h_ngay, allReasons);
    }
    
    if (optimalHanhNgay.size === 0) resultsDiv.innerHTML = "Không tìm thấy số Hành tối ưu.";
    else {
        let html = "";
        optimalHanhNgay.forEach((reasons, h_ngay) => {
            const tooltipText = reasons.join('\n\n-- Hoặc --\n\n').replace(/"/g, '&quot;');
            html += `<div class="toi-uu-item" title="${tooltipText}"><b>Hành ${h_ngay}</b><small>`;
            reasons[0].split('\n').forEach(line => html += `${line}<br>`);
            if (html.endsWith('<br>')) html = html.slice(0, -4);
            html += `</small></div>`;
        });
        resultsDiv.innerHTML = html;
    }
    return optimalHanhNgay;
}

function solveToiUuVan() {
    const resultsDiv = document.getElementById('toi-uu-van-results'); resultsDiv.innerHTML = '';
    const birthYear = document.getElementById('birth-year').value, toaDo = document.getElementById('toa-do').value;
    const tuoiCanChi = birthYear ? getYearCanChiInfo(parseInt(birthYear)).canChi : null, toaInfo = toaDo ? findDataByDegree(toaDo) : null, toaCanChi = toaInfo ? toaInfo.canChi : null;
    const vanTuoiArr = tuoiCanChi ? getVanFromCanChi(tuoiCanChi) : [], vanToaArr = toaCanChi ? getVanFromCanChi(toaCanChi) : [];
    const hasTuoi = vanTuoiArr.length > 0, hasToa = vanToaArr.length > 0;
    if (!hasTuoi && !hasToa) { resultsDiv.innerHTML = 'Vui lòng nhập Tuổi hoặc Tọa để tính tối ưu Vận.'; return new Map(); }

    const optimalVanNgay = new Map();
    for (let v_ngay = 1; v_ngay <= 9; v_ngay++) {
        let allReasons = [];
        if (hasTuoi && hasToa) {
            for (const v_tuoi of vanTuoiArr) for (const v_toa of vanToaArr) {
                const rel_toa_tuoi = checkVanRelations(v_tuoi, v_toa);
                if (rel_toa_tuoi.length > 0) {
                    const rel_ngay_toa = checkVanRelations(v_toa, v_ngay), rel_ngay_tuoi = checkVanRelations(v_tuoi, v_ngay);
                    if (rel_ngay_toa.length > 0 && rel_ngay_tuoi.length > 0) {
                        const reason = `Tọa(${v_toa}) - Tuổi(${v_tuoi}): ${rel_toa_tuoi.join(', ')}\nNgày(${v_ngay}) - Tọa(${v_toa}): ${rel_ngay_toa.join(', ')}\nNgày(${v_ngay}) - Tuổi(${v_tuoi}): ${rel_ngay_tuoi.join(', ')}`;
                        if (!allReasons.includes(reason)) allReasons.push(reason);
                    }
                }
            }
        } else if (hasTuoi) {
             for (const v_tuoi of vanTuoiArr) {
                const rel_ngay_tuoi = checkVanRelations(v_tuoi, v_ngay);
                if (rel_ngay_tuoi.length > 0) { const reason = `Ngày(${v_ngay}) - Tuổi(${v_tuoi}): ${rel_ngay_tuoi.join(', ')}`; if (!allReasons.includes(reason)) allReasons.push(reason); }
            }
        } else if (hasToa) {
             for (const v_toa of vanToaArr) {
                const rel_ngay_toa = checkVanRelations(v_toa, v_ngay);
                if (rel_ngay_toa.length > 0) { const reason = `Ngày(${v_ngay}) - Tọa(${v_toa}): ${rel_ngay_toa.join(', ')}`; if (!allReasons.includes(reason)) allReasons.push(reason); }
            }
        }
        if (allReasons.length > 0) optimalVanNgay.set(v_ngay, allReasons);
    }
    
    if (optimalVanNgay.size === 0) resultsDiv.innerHTML = "Không tìm thấy số Vận tối ưu.";
    else {
        let html = "";
        optimalVanNgay.forEach((reasons, v_ngay) => {
            const tooltipText = reasons.join('\n\n-- Hoặc --\n\n').replace(/"/g, '&quot;');
            html += `<div class="toi-uu-item" title="${tooltipText}"><b>Vận ${v_ngay}</b><small>`;
            reasons[0].split('\n').forEach(line => html += `${line}<br>`);
            if (html.endsWith('<br>')) html = html.slice(0, -4);
            html += `</small></div>`;
        });
        resultsDiv.innerHTML = html;
    }
    return optimalVanNgay;
}

function solveChainedHanhOptimization(optimalHanhNgay) {
    const resultsDiv = document.getElementById('toi-uu-hanh-gio-thang-results'); resultsDiv.innerHTML = '';
    const viewYear = document.getElementById('view-year').value;
    if (!viewYear || !optimalHanhNgay || optimalHanhNgay.size === 0) { resultsDiv.innerHTML = "Không thể tính (cần Năm xem và Trụ Ngày tối ưu)."; return; }
    
    const namCanChi = getYearCanChiInfo(parseInt(viewYear)).canChi, hanhNamArr = getHanhFromCanChi(namCanChi);
    if(hanhNamArr.length === 0) { resultsDiv.innerHTML = "Không xác định được Hành của Năm."; return; }

    const finalResults = new Map(), optimalHanhNgayKeys = [...optimalHanhNgay.keys()];
    for (const h_ngay of optimalHanhNgayKeys) {
        for (let h_thang = 1; h_thang <= 9; h_thang++) {
            const rels_ngay_thang = [...checkHanhRelations(h_ngay, h_thang), ...checkDirectedRelations(h_ngay, h_thang)];
            if (rels_ngay_thang.length === 0) continue;
            for (const h_nam of hanhNamArr) {
                const rels_thang_nam = [...checkHanhRelations(h_thang, h_nam), ...checkDirectedRelations(h_thang, h_nam)];
                const common_rels_after_nam = intersection(rels_ngay_thang, rels_thang_nam);
                if (common_rels_after_nam.length === 0) continue;
                for (let h_gio = 1; h_gio <= 9; h_gio++) {
                    const rels_gio_ngay = [...checkHanhRelations(h_gio, h_ngay), ...checkDirectedRelations(h_ngay, h_gio)];
                    const final_common_rels = intersection(common_rels_after_nam, rels_gio_ngay);
                    for (const rel of final_common_rels) {
                        if (!finalResults.has(rel)) finalResults.set(rel, new Set());
                        finalResults.get(rel).add(`Giờ(${h_gio})-Ngày(${h_ngay})-Tháng(${h_thang})-Năm(${h_nam})`);
                    }
                }
            }
        }
    }
    
    if (finalResults.size === 0) resultsDiv.innerHTML = "Không tìm thấy chuỗi Hành tối ưu.";
    else {
        let html = "";
        finalResults.forEach((tuples, rel) => {
            const tooltipText = [...tuples].join('\n');
            html += `<div class="toi-uu-item" title="${tooltipText}"><b>${rel}</b><small>${[...tuples].slice(0, 2).join('<br>')}${tuples.size > 2 ? '<br>...' : ''}</small></div>`;
        });
        resultsDiv.innerHTML = html;
    }
}

function solveChainedVanOptimization(optimalVanNgay) {
    const resultsDiv = document.getElementById('toi-uu-van-gio-thang-results'); resultsDiv.innerHTML = '';
    const viewYear = document.getElementById('view-year').value;
    if (!viewYear || !optimalVanNgay || optimalVanNgay.size === 0) { resultsDiv.innerHTML = "Không thể tính (cần Năm xem và Trụ Ngày tối ưu)."; return; }
    
    const namCanChi = getYearCanChiInfo(parseInt(viewYear)).canChi, vanNamArr = getVanFromCanChi(namCanChi);
    if(vanNamArr.length === 0) { resultsDiv.innerHTML = "Không xác định được Vận của Năm."; return; }

    const finalResults = new Map(), optimalVanNgayKeys = [...optimalVanNgay.keys()];
    for (const v_ngay of optimalVanNgayKeys) {
        for (let v_thang = 1; v_thang <= 9; v_thang++) {
            const rels_ngay_thang = checkVanRelations(v_ngay, v_thang);
            if (rels_ngay_thang.length === 0) continue;
            for (const v_nam of vanNamArr) {
                const rels_thang_nam = checkVanRelations(v_thang, v_nam);
                const common_rels_after_nam = intersection(rels_ngay_thang, rels_thang_nam);
                if (common_rels_after_nam.length === 0) continue;
                for (let v_gio = 1; v_gio <= 9; v_gio++) {
                    const rels_gio_ngay = checkVanRelations(v_gio, v_ngay);
                    const final_common_rels = intersection(common_rels_after_nam, rels_gio_ngay);
                    for (const rel of final_common_rels) {
                        if (!finalResults.has(rel)) finalResults.set(rel, new Set());
                        finalResults.get(rel).add(`Giờ(${v_gio})-Ngày(${v_ngay})-Tháng(${v_thang})-Năm(${v_nam})`);
                    }
                }
            }
        }
    }
    
    if (finalResults.size === 0) resultsDiv.innerHTML = "Không tìm thấy chuỗi Vận tối ưu.";
    else {
        let html = "";
        finalResults.forEach((tuples, rel) => {
            const tooltipText = [...tuples].join('\n');
            html += `<div class="toi-uu-item" title="${tooltipText}"><b>${rel}</b><small>${[...tuples].slice(0, 2).join('<br>')}${tuples.size > 2 ? '<br>...' : ''}</small></div>`;
        });
        resultsDiv.innerHTML = html;
    }
}

function renderHkdqAnalysis(ketQua) {
    let html = `<style>.hkdq-main-flex-container { display: flex; gap: 10px; align-items: flex-start; } .hkdq-main-flex-container > .hkdq-analysis-grid { flex: 3; display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 5px; } .hkdq-main-flex-container > .hkdq-analysis-summary { flex: 2; } .hkdq-pillar-box { border: 1px solid #e9ecef; padding: 5px; border-radius: 4px; background: #fff; text-align: center; font-size: 11px; } .hkdq-pillar-title { font-weight: bold; font-size: 1em; color: #0056b3; margin-bottom: 4px; border-bottom: 1px solid #eee; padding-bottom: 2px; }</style>`;
    html += '<h6 style="margin:2px 0 5px 0; font-size:12px; color:#333;">Kết quả Phân tích HKĐQ (Huyết Thống)</h6><div class="hkdq-main-flex-container"><div class="hkdq-analysis-grid">';
    ['Trụ Tuổi', 'Trụ Tọa', 'Trụ Ngày', 'Trụ Tháng', 'Trụ Năm', 'Trụ Giờ'].forEach(tenTru => {
        html += `<div class="hkdq-pillar-box"><div class="hkdq-pillar-title">${tenTru.replace('Trụ ','')}</div>`;
        const kq = ketQua.ketQuaCacTru[tenTru];
        if (kq && kq.tenQue) {
            const tt = kq.thongTinDuocChon;
            html += `<span class="que-name" style="font-size: 0.9em; margin-bottom: 2px;">${kq.tenQue}</span>`;
            if (tt) html += `<span class="am-duong ${tt.amDuong === 'Dương' ? 'duong' : 'am'}" style="padding: 2px 6px; font-size: 0.85em;">${tt.amDuong}</span><br><small style="color: #666; line-height: 1.1; font-size: 9px;">${tt.vaiTroChiTiet}<br><em>${tt.giaDinh}</em></small>`;
            else html += `<span class="am-duong khong-xac-dinh" style="padding: 2px 6px; font-size: 0.85em;">KXĐ</span>`;
        } else html += '<span style="color: #999; font-style: italic;">-</span>';
        html += '</div>';
    });
    html += '</div><div class="hkdq-analysis-summary">';
    if (ketQua.canhBao.length > 0) {
        html += `<div class="warning-list" style="margin-bottom: 5px;">`;
        ketQua.canhBao.forEach(cb => { html += `<div class="warning-item ${cb.type === 'critical' ? 'warning-critical' : 'warning-moderate'}" style="padding: 4px 6px; margin: 2px 0; font-size: 10px; gap: 4px;">${cb.type === 'critical' ? '🔴' : '⚠️'} ${cb.message}</div>`; });
        html += `</div>`;
    } else html += `<div class="good-status" style="padding: 4px 6px; margin: 2px 0; font-size: 10px;">✅ Không có cảnh báo</div>`;
    
    html += `<div class="final-rating ${ketQua.ratingClass}" style="margin-top:5px; padding: 5px; font-size: 11px;">🎯 ${ketQua.danhGia}</div>`;
    html += `<div class="info-item huynh-de-info" style="padding: 5px; margin-top: 8px; margin-bottom: 5px; font-size: 11px;"><h5 style="font-size: 1em; margin-bottom: 2px;">👫 Huynh Đệ</h5>`;
    if (ketQua.thongTinHuynhDe.tongHuynhDe > 0) html += `<p style="margin:0; font-size: 10px;"><strong>${ketQua.thongTinHuynhDe.tongHuynhDe} quẻ:</strong> ${ketQua.thongTinHuynhDe.chiTiet}</p>`;
    else html += `<p style="margin:0; font-size: 10px;"><em>Không có</em></p>`;
    html += `</div>`;
    
    if (ketQua.cacCapThatTinh.length > 0) {
        html += `<div class="info-item that-tinh-info" style="padding: 5px; font-size: 11px;"><h5 style="font-size: 1em; margin-bottom: 2px;">🌟 Thất Tinh Đả Kiếp</h5>`;
        ketQua.cacCapThatTinh.forEach(cap => html += `<p style="margin: 2px 0; font-size: 10px;">${cap.tru1.replace('Trụ ','')} (${cap.que1}) ↔ ${cap.tru2.replace('Trụ ','')} (${cap.que2})</p>`);
        html += `</div>`;
    }
    html += '</div></div>';
    return html;
}

function populateAnalysisTable(clickedCell) {
    const row = clickedCell.closest('tr'); if (!row) return;
    const getHanh = (attr) => (row.dataset[attr] || '').split(',').map(Number).filter(n => !isNaN(n) && n > 0);
    const getVan = (attr) => (row.dataset[attr] || '').split(',').map(Number).filter(n => !isNaN(n) && n > 0);
    const getHanhGio = () => (clickedCell.dataset.hanhGio || '').split(',').map(Number).filter(n => !isNaN(n) && n > 0);
    const getVanGio = () => (clickedCell.dataset.vanGio || '').split(',').map(Number).filter(n => !isNaN(n) && n > 0);

    const hanh = { tuoi: getHanh('hanhTuoi'), toa: getHanh('hanhToa'), ngay: getHanh('hanhNgay'), thang: getHanh('hanhThang'), nam: getHanh('hanhNam'), gio: getHanhGio() };
    const van = { tuoi: getVan('vanTuoi'), toa: getVan('vanToa'), ngay: getVan('vanNgay'), thang: getVan('vanThang'), nam: getVan('vanNam'), gio: getVanGio() };
    
    document.getElementById('an-hanh-tuoi-toa').innerText = analyzeHanhPair(hanh.tuoi, hanh.toa); document.getElementById('an-hanh-tuoi-ngay').innerText = analyzeHanhPair(hanh.tuoi, hanh.ngay); document.getElementById('an-hanh-toa-ngay').innerText = analyzeHanhPair(hanh.toa, hanh.ngay); document.getElementById('an-hanh-ngay-gio').innerText = analyzeHanhPair(hanh.ngay, hanh.gio); document.getElementById('an-hanh-ngay-thang').innerText = analyzeHanhPair(hanh.ngay, hanh.thang); document.getElementById('an-hanh-ngay-nam').innerText = analyzeHanhPair(hanh.ngay, hanh.nam); document.getElementById('an-hanh-thang-nam').innerText = analyzeHanhPair(hanh.thang, hanh.nam);
    document.getElementById('an-van-tuoi-toa').innerText = analyzeVanPair(van.tuoi, van.toa); document.getElementById('an-van-tuoi-ngay').innerText = analyzeVanPair(van.tuoi, van.ngay); document.getElementById('an-van-toa-ngay').innerText = analyzeVanPair(van.toa, van.ngay); document.getElementById('an-van-ngay-gio').innerText = analyzeVanPair(van.ngay, van.gio); document.getElementById('an-van-ngay-thang').innerText = analyzeVanPair(van.ngay, van.thang); document.getElementById('an-van-ngay-nam').innerText = analyzeVanPair(van.ngay, van.nam); document.getElementById('an-van-thang-nam').innerText = analyzeVanPair(van.thang, van.nam);
    
    const getChi = (canChiStr) => { if (!canChiStr || typeof canChiStr !== 'string' || !canChiStr.includes(' ')) return null; return canChiStr.split(' ')[1]; };
    const chi = { tuoi: getChi(row.dataset.canchiTuoi), toa: getChi(row.dataset.canchiToa), nam: getChi(row.dataset.canchiNamTk), thang: getChi(row.dataset.canchiThang), ngay: getChi(row.dataset.canchiNgay), gio: getChi(clickedCell.dataset.canchiGio) };
    const checkXung = (chi1, chi2, cellId) => { const cell = document.getElementById(cellId); if (chi1 && chi2 && LUC_XUNG_MAP[chi1] === chi2) cell.innerHTML = '<span style="color: red; font-weight: bold;">Xung</span>'; else cell.innerText = '-'; };
    checkXung(chi.tuoi, chi.toa, 'an-canchi-tuoi-toa'); checkXung(chi.tuoi, chi.ngay, 'an-canchi-tuoi-ngay'); checkXung(chi.toa, chi.ngay, 'an-canchi-toa-ngay'); checkXung(chi.ngay, chi.gio, 'an-canchi-ngay-gio'); checkXung(chi.ngay, chi.thang, 'an-canchi-ngay-thang'); checkXung(chi.ngay, chi.nam, 'an-canchi-ngay-nam'); checkXung(chi.thang, chi.nam, 'an-canchi-thang-nam');
    document.getElementById('an-ghi-chu').innerHTML = '-';

    const getFirstQueFromCanChi = (canChi) => { if (!canChi || canChi === 'N/A') return ''; const ques = huyenKhongQueMap[canChi]; return (ques && ques.length > 0) ? ques[0] : ''; };
    const inputForHkdq = { truTuoi: getFirstQueFromCanChi(row.dataset.canchiTuoi), truToa: getFirstQueFromCanChi(row.dataset.canchiToa), truNgay: getFirstQueFromCanChi(row.dataset.canchiNgay), truThang: getFirstQueFromCanChi(row.dataset.canchiThang), truNam: getFirstQueFromCanChi(row.dataset.canchiNamTk), truGio: getFirstQueFromCanChi(clickedCell.dataset.canchiGio) };
    
    document.getElementById('hkdq-analysis-cell').innerHTML = renderHkdqAnalysis(phanTichNhatKhoaDayDu(inputForHkdq));
    document.getElementById('analysis-container').style.display = 'block';
}

function formatHourCellContent(canChi, dayCan, dayTietKhi) {
    if (!canChi) return 'N/A';
    let html = `<div style="font-weight: bold; text-align: center;">${canChi}</div>`;
    html += '<b>1. Huyền Không Đại Quái</b><br>';
    const hqdqRaw = formatHccvAndQue(canChi);
    const hqdqHtml = hqdqRaw.replace(/\n-----\n/g, '<br>-----<br>').replace(/\n/g, '<br>');
    html += hqdqHtml === 'N/A<br>N/A' ? 'N/A<br>N/A<br>' : hqdqHtml + '<br>';

    html += '<b>2. Kỳ Môn Độn Giáp</b><br>Cục: (chưa tính)<br>Toạ: (chưa tính)<br>Hướng: (chưa tính)<br>';
    let quyNhanText = './.';
    if (dayCan && dayTietKhi && QUY_NHAN_DATA[dayCan] && QUY_NHAN_DATA[dayCan][dayTietKhi]) {
        const hourChi = canChi.split(' ')[1], foundQuyNhan = QUY_NHAN_DATA[dayCan][dayTietKhi][hourChi];
        if (foundQuyNhan) quyNhanText = `<span class="quy-nhan-text">${foundQuyNhan}</span>`;
    }
    html += `<b>3. Thiên Ất Quý Nhân</b><br>${quyNhanText}`;
    return html;
}

async function generateYearTable() {
    const lunarYearToView = parseInt(document.getElementById('view-year').value);
    if (!lunarYearToView || isNaN(lunarYearToView)) return;
    const loadingOverlay = document.getElementById('loading-overlay'); loadingOverlay.style.display = 'flex'; await new Promise(resolve => setTimeout(resolve, 10));

    const birthYear = document.getElementById('birth-year').value, birthYearInfo = birthYear ? getYearCanChiInfo(parseInt(birthYear)) : {canChi: ''};
    const toaDo = document.getElementById('toa-do').value, truToaInfo = toaDo ? findDataByDegree(toaDo) : null;
    const locationName = document.getElementById('location-check').value, { tietKhiSet } = updateThaiDuongAmTable();
    const startLunarYearJDN = getLunarNewYearJDN(lunarYearToView), endLunarYearJDN = getLunarNewYearJDN(lunarYearToView + 1) - 1;
    const finalStartDateJDN = startLunarYearJDN - 15, finalEndDateJDN = endLunarYearJDN + 15;
    const tableBody = document.getElementById('table-body');
    let tableHtml = '', stt = 1;

    for (let jdn = finalStartDateJDN; jdn <= finalEndDateJDN; jdn++, stt++) {
        const dayInfo = getDateInfo(jdn);
        const lapXuanThisYearJDN = getLapXuanJDN(dayInfo.solarYear);
        let tietKhiYear = jdn < lapXuanThisYearJDN ? dayInfo.solarYear - 1 : dayInfo.solarYear;
        const namCanChiTK = getYearCanChiInfo(tietKhiYear).canChi;
        const dayOfWeek = NGAY_TRONG_TUAN[(jdn + 1) % 7];
        const solarNoonStr = await getSolarNoon(jdn, locationName);
        const tietKhiMonth = getTietKhiMonth(dayInfo.tietKhi);
        let thangCanChiTK = 'N/A';
        const tietKhiMonthNum = parseInt(tietKhiMonth, 10);
        if (!isNaN(tietKhiMonthNum)) {
            const canNamTKIndex = (tietKhiYear + 6) % 10, canThangDauMap = [2, 4, 6, 8, 0], canThangDauIndex = canThangDauMap[canNamTKIndex % 5];
            const canThangTKIndex = (canThangDauIndex + tietKhiMonthNum - 1) % 10;
            thangCanChiTK = THIEN_CAN[canThangTKIndex] + " " + tietKhiMonthChi[tietKhiMonthNum - 1];
        }

        const truNgayRaw = formatHccvAndQue(dayInfo.dayCanChi);
        const truNgayHtml = truNgayRaw.split('\n').map(line => { const match = line.match(/^(\d+)(\s*-.*)/); return match ? `<span class="hanh-number">${match[1]}</span>${match[2]}` : line; }).join('\n');
        const hanhTuoi = getHanhFromCanChi(birthYearInfo.canChi).join(','), vanTuoi = getVanFromCanChi(birthYearInfo.canChi).join(',');
        const hanhToa = truToaInfo ? getHanhFromCanChi(truToaInfo.canChi).join(',') : '', vanToa = truToaInfo ? getVanFromCanChi(truToaInfo.canChi).join(',') : '';
        const hanhNgay = getHanhFromCanChi(dayInfo.dayCanChi).join(','), vanNgay = getVanFromCanChi(dayInfo.dayCanChi).join(',');
        const hanhThang = getHanhFromCanChi(thangCanChiTK).join(','), vanThang = getVanFromCanChi(thangCanChiTK).join(',');
        const hanhNam = getHanhFromCanChi(namCanChiTK).join(','), vanNam = getVanFromCanChi(namCanChiTK).join(',');
        const tietKhiClass = tietKhiSet.has(dayInfo.tietKhi) ? 'tiet-khi-highlight' : '';

        tableHtml += `<tr data-hanh-tuoi="${hanhTuoi}" data-hanh-toa="${hanhToa}" data-hanh-ngay="${hanhNgay}" data-hanh-thang="${hanhThang}" data-hanh-nam="${hanhNam}" data-van-tuoi="${vanTuoi}" data-van-toa="${vanToa}" data-van-ngay="${vanNgay}" data-van-thang="${vanThang}" data-van-nam="${vanNam}" data-canchi-tuoi="${birthYearInfo.canChi}" data-canchi-toa="${truToaInfo ? truToaInfo.canChi : ''}" data-canchi-ngay="${dayInfo.dayCanChi}" data-canchi-thang="${thangCanChiTK}" data-canchi-nam-tk="${namCanChiTK}">
            <td data-col-idx="0">${stt}</td><td data-col-idx="1">${String(dayInfo.solarDay).padStart(2, '0')}/${String(dayInfo.solarMonth).padStart(2, '0')}/${dayInfo.solarYear}</td><td data-col-idx="2">${dayInfo.lunarDay}/${dayInfo.lunarMonth}${dayInfo.lunarLeap ? ' (nhuận)' : ''}/${dayInfo.lunarYear}</td><td data-col-idx="3">${dayInfo.lunarDay}</td><td data-col-idx="4">${dayInfo.lunarMonth}${dayInfo.lunarLeap ? ' (N)' : ''}</td><td data-col-idx="5">${dayInfo.lunarYear}</td><td data-col-idx="6">${dayInfo.dayCanChi}</td><td data-col-idx="7">${dayInfo.monthCanChi}</td><td data-col-idx="8">${dayInfo.yearCanChi}</td><td data-col-idx="9" class="${tietKhiClass}">${dayInfo.tietKhi}</td><td data-col-idx="10">${tietKhiMonth}</td><td data-col-idx="11">${thangCanChiTK}</td><td data-col-idx="12">${namCanChiTK}</td><td data-col-idx="13" style="color: red;">${solarNoonStr}</td><td data-col-idx="14">${dayOfWeek}</td>
            <td data-col-idx="15" class="tru-cell">${formatHccvAndQue(birthYearInfo.canChi)}</td><td data-col-idx="16" class="tru-cell">${truToaInfo ? formatHccvAndQue(truToaInfo.canChi) : 'N/A\nN/A'}</td><td data-col-idx="17" class="tru-cell">${truNgayHtml}</td><td data-col-idx="18" class="tru-cell">${formatHccvAndQue(thangCanChiTK)}</td><td data-col-idx="19" class="tru-cell">${formatHccvAndQue(namCanChiTK)}</td>`;

        const hours = [23, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21], dayCan = dayInfo.dayCanChi.split(" ")[0];
        for (let j = 0; j < hours.length; j++) {
            const hour = hours[j], hourCanChiText = getHourCanChi(dayCan, hour), hanhGio = getHanhFromCanChi(hourCanChiText).join(','), vanGio = getVanFromCanChi(hourCanChiText).join(',');
            tableHtml += `<td class="hour-cell" data-col-idx="${20+j}" data-hanh-gio="${hanhGio}" data-van-gio="${vanGio}" data-canchi-gio="${hourCanChiText}">${formatHourCellContent(hourCanChiText, dayCan, dayInfo.tietKhi)}</td>`;
        }
        tableHtml += `</tr>`;
    }
    tableBody.innerHTML = tableHtml;
    loadingOverlay.style.display = 'none';
}

function setupColumnToggles() {
    const toggleContainer = document.getElementById('column-toggle-controls'); toggleContainer.innerHTML = '<span>Ẩn/Hiện Cột:</span>';
    document.querySelectorAll('#main-table thead [data-col-idx]').forEach(th => {
        const index = th.getAttribute('data-col-idx'), headerText = th.textContent.trim();
        if (!headerText || th.hasAttribute('colspan')) return;
        const checkboxId = `toggle-col-${index}`, label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" id="${checkboxId}" data-col-index="${index}" checked> ${headerText}`;
        toggleContainer.appendChild(label); document.getElementById(checkboxId).addEventListener('change', applyColumnVisibility);
    });
}

function applyColumnVisibility() {
    const dynamicStyles = document.getElementById('dynamic-column-styles'); let cssRules = '';
    document.querySelectorAll('#column-toggle-controls input[type="checkbox"]').forEach(cb => { if (!cb.checked) cssRules += `#main-table [data-col-idx="${cb.getAttribute('data-col-index')}"] { display: none; }\n`; });
    dynamicStyles.innerHTML = cssRules;
    let hkdqVisibleCount = 0, gioVisibleCount = 0;
    document.querySelectorAll('#main-table thead tr:nth-child(2) th[data-col-idx]').forEach(th => {
        const correspondingCheckbox = document.getElementById(`toggle-col-${th.getAttribute('data-col-idx')}`);
        if (correspondingCheckbox && correspondingCheckbox.checked) { if (th.classList.contains('header-hkdq')) hkdqVisibleCount++; else if (th.classList.contains('header-gio')) gioVisibleCount++; }
    });
    const hkdqGroupHeader = document.querySelector('#main-table thead .header-hkdq[colspan]'), gioGroupHeader = document.querySelector('#main-table thead .header-gio[colspan]');
    if (hkdqGroupHeader) { hkdqGroupHeader.setAttribute('colspan', hkdqVisibleCount > 0 ? hkdqVisibleCount : 1); hkdqGroupHeader.style.display = hkdqVisibleCount > 0 ? '' : 'none'; }
    if (gioGroupHeader) { gioGroupHeader.setAttribute('colspan', gioVisibleCount > 0 ? gioVisibleCount : 1); gioGroupHeader.style.display = gioVisibleCount > 0 ? '' : 'none'; }
}

function createFilterInputs() {
    const filterRow = document.getElementById('filter-row'); filterRow.innerHTML = '';
    const totalCols = 32, canChiCols = [6, 7, 8, 11, 12], advancedFilterCols = [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
    for (let i = 0; i < totalCols; i++) {
        const th = document.createElement('th'); th.setAttribute('data-col-idx', i);
        if (advancedFilterCols.includes(i)) th.innerHTML = `<div class="horizontal-filter-group"><input type="text" class="filter-input-hanh" data-column-filter="${i}" placeholder="H"><input type="text" class="filter-input-can-adv" data-column-filter="${i}" placeholder="C"><input type="text" class="filter-input-chi-adv" data-column-filter="${i}" placeholder="C"><input type="text" class="filter-input-van" data-column-filter="${i}" placeholder="V"></div>`;
        else if (canChiCols.includes(i)) th.innerHTML = `<div class="filter-group"><input type="text" class="filter-input-can" data-column-filter="${i}" placeholder="Can"><input type="text" class="filter-input-chi" data-column-filter="${i}" placeholder="Chi"></div>`;
        else th.innerHTML = `<input type="text" class="filter-input" data-column-filter="${i}" placeholder="Lọc...">`;
        filterRow.appendChild(th);
    }
    document.querySelectorAll('#filter-row input').forEach(input => input.addEventListener('keyup', applyFilters));
    applyColumnVisibility();
}

function applyFilters() {
    const filters = {}; const addFilter = (col, type, value) => { if (!filters[col]) filters[col] = {}; filters[col][type] = value; };
    document.querySelectorAll('#filter-row .filter-input').forEach(input => { if (input.value) addFilter(input.dataset.columnFilter, 'regular', input.value.toLowerCase().split(',').map(c => c.trim()).filter(c => c)); });
    document.querySelectorAll('#filter-row .filter-input-can').forEach(input => { if (input.value) addFilter(input.dataset.columnFilter, 'can', input.value.toLowerCase().split(',').map(c => c.trim()).filter(c => c)); });
    document.querySelectorAll('#filter-row .filter-input-chi').forEach(input => { if (input.value) addFilter(input.dataset.columnFilter, 'chi', input.value.toLowerCase().split(',').map(c => c.trim()).filter(c => c)); });
    document.querySelectorAll('#filter-row .filter-input-hanh').forEach(input => { if (input.value) addFilter(input.dataset.columnFilter, 'hanh', input.value.split(',').map(c => c.trim()).filter(c => c)); });
    document.querySelectorAll('#filter-row .filter-input-can-adv').forEach(input => { if (input.value) addFilter(input.dataset.columnFilter, 'can_adv', input.value.toLowerCase().split(',').map(c => c.trim()).filter(c => c)); });
    document.querySelectorAll('#filter-row .filter-input-chi-adv').forEach(input => { if (input.value) addFilter(input.dataset.columnFilter, 'chi_adv', input.value.toLowerCase().split(',').map(c => c.trim()).filter(c => c)); });
    document.querySelectorAll('#filter-row .filter-input-van').forEach(input => { if (input.value) addFilter(input.dataset.columnFilter, 'van', input.value.split(',').map(c => c.trim()).filter(c => c)); });
    
    const advancedFilterCols = [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31], activeFilterKeys = Object.keys(filters), hasFilters = activeFilterKeys.length > 0;
    document.querySelectorAll('#table-body tr').forEach(row => {
        let isVisible = true;
        if (hasFilters) {
            for (const colIndex of activeFilterKeys) {
                const filter = filters[colIndex], cell = row.querySelector(`td[data-col-idx="${colIndex}"]`);
                if (!cell) { isVisible = false; break; }
                if (advancedFilterCols.includes(parseInt(colIndex))) {
                    const lines = cell.textContent.match(/(\d+) - ([^-]+)-([^-]+) - (\d+)/g) || [];
                    let lineIsVisible = false;
                    const noAdvFilter = !filter.hanh && !filter.can_adv && !filter.chi_adv && !filter.van;
                    if (lines.length === 0 && noAdvFilter) lineIsVisible = true;
                    else if (lines.length > 0) {
                        for (const line of lines) {
                            const [h, canChi, v] = line.split(' - ').map(p => p.trim()); const [can, chi] = canChi.split('-');
                            if ((!filter.hanh || filter.hanh.length === 0 || filter.hanh.includes(h)) && (!filter.can_adv || filter.can_adv.length === 0 || filter.can_adv.some(c => can.toLowerCase().includes(c))) && (!filter.chi_adv || filter.chi_adv.length === 0 || filter.chi_adv.some(c => chi.toLowerCase().includes(c))) && (!filter.van || filter.van.length === 0 || filter.van.includes(v))) { lineIsVisible = true; break; }
                        }
                    }
                    if (!lineIsVisible) { isVisible = false; break; }
                } else {
                    const cellText = cell.textContent.toLowerCase().trim();
                    if (filter.regular && filter.regular.length > 0) {
                        if (colIndex === '10' && !filter.regular.includes(cellText)) { isVisible = false; break; }
                        else if (colIndex !== '10' && !filter.regular.some(c => cellText.includes(c))) { isVisible = false; break; }
                    }
                    if (filter.can || filter.chi) { 
                        const [canPart = '', chiPart = ''] = cellText.split(' '); 
                        if (filter.can && filter.can.length > 0 && !filter.can.some(c => canPart.includes(c))) { isVisible = false; break; } 
                        if (filter.chi && filter.chi.length > 0 && !filter.chi.some(c => chiPart.includes(c))) { isVisible = false; break; } 
                    }
                }
            }
        }
        row.style.display = isVisible ? '' : 'none';
    });
}

// --- KHỞI TẠO TRANG ---
window.onload = async () => {
    try {
        document.getElementById('view-year').value = new Date().getFullYear();
        const fullRebuild = async () => {
            document.getElementById('loading-overlay').style.display = 'flex'; await new Promise(resolve => setTimeout(resolve, 50));
            updateTuoiXemInfo(); updateNamXemInfo(); updateToaDoInfo(); updateSummaryTable(); updateTamHopBoLongTable(); updateThaiDuongAmTable(); 
            solveChainedHanhOptimization(solveToiUu()); solveChainedVanOptimization(solveToiUuVan());
            await generateYearTable(); applyFilters(); document.getElementById('loading-overlay').style.display = 'none';
        };

        await fullRebuild(); setupColumnToggles(); createFilterInputs(); 
        
        ['birth-year', 'toa-do', 'view-year'].forEach(id => {
            const el = document.getElementById(id);
            el.addEventListener('keyup', async (e) => { if (e.key === 'Enter') await fullRebuild(); });
            el.addEventListener('change', fullRebuild);
        });
        document.getElementById('location-check').addEventListener('keyup', async (e) => { if (e.key === 'Enter') { await generateYearTable(); applyFilters(); } });
        
        const tableBody = document.getElementById('table-body');
        tableBody.addEventListener('click', (e) => {
            const sttCell = e.target.closest('td[data-col-idx="0"]'); if (sttCell) { sttCell.parentElement.classList.toggle('row-marked'); return; }
            const hourCell = e.target.closest('.hour-cell');
            if (hourCell) {
                const prevSelected = document.querySelector('.hour-cell.analysis-selected'); if (prevSelected) prevSelected.classList.remove('analysis-selected');
                hourCell.classList.add('analysis-selected'); populateAnalysisTable(hourCell);
            }
        });
        tableBody.addEventListener('dblclick', (e) => { const hourCell = e.target.closest('.hour-cell'); if (hourCell) { e.preventDefault(); hourCell.classList.toggle('manual-highlight'); } });
        
        document.getElementById('btn-toggle-hidden-rows').addEventListener('click', (e) => {
            document.body.classList.toggle('hide-mode'); e.target.textContent = document.body.classList.contains('hide-mode') ? 'Hiện Lại Dòng' : 'Ẩn Dòng'; e.target.classList.toggle('active');
        });
        document.getElementById('btn-notes').addEventListener('click', () => { document.getElementById('notes-container').style.display = document.getElementById('notes-container').style.display === 'block' ? 'none' : 'block'; });
        document.getElementById('btn-print-view').addEventListener('click', () => { document.body.classList.remove('print-mode-khach'); window.print(); });
        document.getElementById('btn-print-khach').addEventListener('click', () => {
            document.body.classList.add('print-mode-khach');
            const afterPrintHandler = () => { document.body.classList.remove('print-mode-khach'); window.removeEventListener('afterprint', afterPrintHandler); };
            window.addEventListener('afterprint', afterPrintHandler); window.print();
        });
    } catch (error) { document.getElementById('loading-overlay').innerHTML = '<span>Đã xảy ra lỗi! Vui lòng tải lại trang.</span>'; }
};
