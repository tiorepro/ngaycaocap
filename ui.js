// ==========================================
// UI.JS - Giao diện & Xử lý DOM
// ==========================================
// Render bảng, hiển thị thông tin, filter,
// cập nhật tất cả các khối giao diện.

// ---------- CẬP NHẬT INFO BOX ----------
function updateInfoBox(infoDiv, canChi, isToa = false, phamInfo = null) {
    const formattedString = formatHccvAndQue(canChi);
    const parts = formattedString.split('\n-----\n');
    const mainInfo = parts[0].split('\n');
    const hccv = mainInfo[0] || 'N/A';
    const que = mainInfo[1] || 'N/A';

    let html = '<table>';
    if (isToa) {
        html += '<tr><td colspan="2" style="text-align:center;font-weight:bold;background:#f2f2f2;">HKĐQ</td></tr>';
        const toaDo = document.getElementById('toa-do').value;
        const toaInfo = findDataByDegree(toaDo);
        if (toaInfo) {
            html += `<tr><td>Phương:</td><td>${toaInfo.phuong}</td></tr>`;
            html += `<tr><td>Hướng:</td><td>${toaInfo.huong}</td></tr>`;
            html += `<tr><td>Sơn:</td><td>${toaInfo.son}</td></tr>`;
        }
    }
    html += `<tr><td>Can Chi:</td><td>${canChi}</td></tr>`;
    if (LUC_THAP_NAP_AM_MAP[canChi] && !isToa) {
        html += `<tr><td>Nạp Âm:</td><td>${LAC_THU_NAP_AM_MAP[canChi]}<br><small>(${LUC_THAP_NAP_AM_MAP[canChi]})</small></td></tr>`;
    }
    if (parts.length > 1) {
        const secondInfo = parts[1].split('\n');
        html += `<tr><td>Quẻ:</td><td>${que}<br/>${secondInfo[1] || ''}</td></tr>`;
        html += `<tr><td>H-C-C-V:</td><td>${hccv}<br/>${secondInfo[0] || ''}</td></tr>`;
    } else {
        html += `<tr><td>Quẻ:</td><td>${que}</td></tr>`;
        html += `<tr><td>H-C-C-V:</td><td>${hccv}</td></tr>`;
    }
    if (isToa && phamInfo) {
        html += `<tr><td>Phạm:</td><td class="toa-do-pham-cell ${phamInfo.class}">${phamInfo.text}</td></tr>`;
    }
    html += '</table>';
    infoDiv.innerHTML = html;
}

// ---------- CẬP NHẬT CÁC KHỐI THÔNG TIN ----------
function updateTuoiXemInfo() {
    const year = document.getElementById('birth-year').value;
    const infoDiv = document.getElementById('birth-year-info');
    if (!year || isNaN(year)) { infoDiv.innerHTML = ''; return; }
    updateInfoBox(infoDiv, getYearCanChiInfo(parseInt(year)).canChi, false);
}

function updateToaDoInfo() {
    const degree = document.getElementById('toa-do').value;
    const infoDiv = document.getElementById('toa-do-info');
    if (degree === '' || isNaN(parseFloat(degree))) { infoDiv.innerHTML = ''; return; }
    const toaInfo = findDataByDegree(degree);
    if (!toaInfo) {
        infoDiv.innerHTML = '<table><tr><td colspan="2" style="color:red;font-weight:bold;">Không có dữ liệu cho độ số này.</td></tr></table>';
        return;
    }

    const viewYear = document.getElementById('view-year').value;
    let phamInfo = null;
    if (viewYear && !isNaN(viewYear)) {
        const satsInfo = calculateAllYearlySats(parseInt(viewYear));
        if (satsInfo) {
            const toaHuongPalace = huongToPalaceNameMap[toaInfo.huong], toaSon = toaInfo.son;
            const phamList = new Set();
            const nguHoangNamPalace = satsInfo.nguHoangNam, oppositeNguHoangPalace = palaceOpposites[nguHoangNamPalace];
            if (toaHuongPalace === nguHoangNamPalace || toaHuongPalace === oppositeNguHoangPalace) phamList.add("Trục Ngũ Hoàng");
            const batSatHuong = BAT_SAT_NAM_CHI_MAP[satsInfo.yearChi];
            if (batSatHuong && toaInfo.huong === batSatHuong) phamList.add("Bát Sát");
            if (satsInfo.thaiTue.split(' - ').includes(toaSon)) phamList.add('Thái Tuế');
            if (satsInfo.tuePha.split(' - ').includes(toaSon)) phamList.add('Xung Thái Tuế');
            const allTamSatSons = getTamSatSonsForYear(satsInfo.yearChi);
            if (allTamSatSons.includes(toaSon)) phamList.add("Tam Sát");
            phamInfo = phamList.size > 0
                ? { text: `(${[...phamList].join(', ')})`, class: '' }
                : { text: 'KHÔNG PHẠM', class: 'khong-pham' };
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

    const infoContainer = document.createElement('div');
    updateInfoBox(infoContainer, yearInfo.canChi, false);
    let html = infoContainer.innerHTML.replace('</table>', '');

    const nguHoangSon = palaceToSonMap[satsInfo.nguHoangNam] || [];
    const nhiHacSon = palaceToSonMap[satsInfo.nhiHacNam] || [];
    html += `<tr><td>Ngũ Hoàng (Năm):</td><td class="highlight-5">${satsInfo.nguHoangNam} (${nguHoangSon.join(',')})</td></tr>`;
    html += `<tr><td>Nhị Hắc (Năm):</td><td class="highlight-2">${satsInfo.nhiHacNam} (${nhiHacSon.join(',')})</td></tr>`;
    html += `<tr><td>Thái Tuế:</td><td>${satsInfo.thaiTue}</td></tr>`;
    html += `<tr><td>Xung Thái Tuế:</td><td>${satsInfo.tuePha}</td></tr>`;
    html += `<tr><td>Tam Sát:</td><td style="white-space:normal;text-align:left;">${getDetailedTamSatInfo(satsInfo.yearChi)}</td></tr>`;
    html += `<tr><td>Bát Sát:</td><td>${BAT_SAT_NAM_CHI_MAP[satsInfo.yearChi] || 'Không có'}</td></tr>`;

    // Bảng Ngũ Hoàng / Nhị Hắc theo tháng
    html += `<tr><td colspan="2"><table class="sub-table"><tr><th>Tháng</th>`;
    for (let i = 1; i <= 12; i++) html += `<th>${i}</th>`;
    html += `</tr><tr><td>Ngũ Hoàng</td>`;
    for (let i = 1; i <= 12; i++) {
        const p = satsInfo.monthlyStars[i].nguHoang, s = palaceToSonMap[p] || [];
        html += `<td class="highlight-5">${p}<br><small>(${s.join(',')})</small></td>`;
    }
    html += `</tr><tr><td>Nhị Hắc</td>`;
    for (let i = 1; i <= 12; i++) {
        const p = satsInfo.monthlyStars[i].nhiHac, s = palaceToSonMap[p] || [];
        html += `<td class="highlight-2">${p}<br><small>(${s.join(',')})</small></td>`;
    }
    html += `</tr></table></td></tr></table>`;
    infoDiv.innerHTML = html;
}

// ---------- BẢNG SUMMARY ----------
function updateSummaryTable() {
    document.querySelectorAll('#summary-table tbody td[id]:not([id^="thbl-"])').forEach(td => td.innerText = '');
    const toaDo = document.getElementById('toa-do').value, viewYear = document.getElementById('view-year').value, birthYear = document.getElementById('birth-year').value;
    if (!toaDo || !viewYear || !birthYear) return;
    const toaInfo = findDataByDegree(toaDo), satsInfo = calculateAllYearlySats(parseInt(viewYear)), birthInfo = getYearCanChiInfo(parseInt(birthYear));
    if (!toaInfo || !satsInfo || !birthInfo) return;

    const setCell = (id, text) => { const cell = document.getElementById(id); if (cell) cell.innerText = Array.isArray(text) ? text.join(', ') : text || ''; };

    const avoid_strict = { thangChi: new Set(), ngayCan: new Set(), ngayChi: new Set(), gioCan: new Set(), gioChi: new Set() };
    const avoid_warning = { thangChi: new Set(), ngayChi: new Set(), gioChi: new Set() };
    const choose = { thangChi: new Set(), ngayCan: new Set(), ngayChi: new Set(), gioCan: new Set(), gioChi: new Set() };

    // Ngũ Hoàng
    const namChiAvoidNguHoang = (palaceToSonMap[satsInfo.nguHoangNam] || []).filter(s => DIA_CHI.includes(s));
    setCell('tranh-nguhoang-nam-chi', [...new Set(namChiAvoidNguHoang)]);

    const huongPalaceName = huongToPalaceNameMap[toaInfo.huong];
    if (huongPalaceName) {
        const oppositeHuongPalace = palaceOpposites[huongPalaceName];
        const thangChiAvoidNguHoang = new Set();
        for (let m = 1; m <= 12; m++) {
            if ([huongPalaceName, oppositeHuongPalace].includes(satsInfo.monthlyStars[m].nguHoang)) {
                thangChiAvoidNguHoang.add(tietKhiMonthChi[m - 1]);
            }
        }
        [...thangChiAvoidNguHoang].forEach(c => avoid_strict.thangChi.add(c));
        setCell('tranh-nguhoang-thang-chi', [...thangChiAvoidNguHoang]);
    }

    // Xung Thái Tuế, Tam Sát, Bát Sát...
    const tuePhaChi = satsInfo.tuePha.split(' - ')[1];
    if (tuePhaChi) { avoid_strict.thangChi.add(tuePhaChi); avoid_strict.ngayChi.add(tuePhaChi); avoid_strict.gioChi.add(tuePhaChi); }
    ['nam','thang','ngay','gio'].forEach(tf => setCell(`tranh-tuepha-${tf}-chi`, tuePhaChi));

    const tamSatPhuongMap = { 'NAM': ['Thân','Tý','Thìn'], 'BẮC': ['Dần','Ngọ','Tuất'], 'TÂY': ['Hợi','Mão','Mùi'], 'ĐÔNG': ['Tị','Dậu','Sửu'] };
    const tamSatChi = toaInfo.phuong ? (tamSatPhuongMap[toaInfo.phuong] || []) : [];
    if (tamSatChi.length > 0) {
        tamSatChi.forEach(c => { avoid_strict.thangChi.add(c); avoid_strict.ngayChi.add(c); avoid_strict.gioChi.add(c); });
        ['nam','thang','ngay','gio'].forEach(tf => setCell(`tranh-tamsat-${tf}-chi`, tamSatChi));
    }

    const batSatChi = BAT_SAT_HUONG_MAP[toaInfo.huong] || '';
    if (batSatChi) { avoid_strict.thangChi.add(batSatChi); avoid_strict.ngayChi.add(batSatChi); avoid_strict.gioChi.add(batSatChi); }
    ['nam','thang','ngay','gio'].forEach(tf => setCell(`tranh-batsat-${tf}-chi`, batSatChi));

    const xungToaChi = LUC_XUNG_MAP[toaInfo.canChi ? toaInfo.canChi.split(' ')[1] : ''] || '';
    if (xungToaChi) { avoid_warning.thangChi.add(xungToaChi); avoid_warning.ngayChi.add(xungToaChi); avoid_warning.gioChi.add(xungToaChi); }
    ['nam','thang','ngay','gio'].forEach(tf => setCell(`tranh-xungtoa-${tf}-chi`, xungToaChi));

    const xungTuoiChi = LUC_XUNG_MAP[birthInfo.canChi ? birthInfo.canChi.split(' ')[1] : ''] || '';
    if (xungTuoiChi) { avoid_warning.thangChi.add(xungTuoiChi); avoid_warning.ngayChi.add(xungTuoiChi); avoid_warning.gioChi.add(xungTuoiChi); }
    ['nam','thang','ngay','gio'].forEach(tf => setCell(`tranh-xungtuoi-${tf}-chi`, xungTuoiChi));

    // Các cục chọn (Tự Hợp, Sinh Hợp, Tam Hợp)
    const phuong = toaInfo.phuong;
    const tuHopMap = { 'ĐÔNG':{can:['Giáp','Ất'],chi:['Dần','Mão','Thìn']}, 'TÂY':{can:['Canh','Tân'],chi:['Thân','Dậu','Tuất']}, 'NAM':{can:['Bính','Đinh'],chi:['Tị','Ngọ','Mùi']}, 'BẮC':{can:['Nhâm','Quý'],chi:['Hợi','Tý','Sửu']} };
    const sinhHopMap = { 'ĐÔNG':{can:['Nhâm','Quý'],chi:['Hợi','Tý','Sửu']}, 'TÂY':{can:['Mậu','Kỷ'],chi:['Thìn','Tuất','Sửu','Mùi']}, 'NAM':{can:['Giáp','Ất'],chi:['Dần','Mão','Thìn']}, 'BẮC':{can:['Canh','Tân'],chi:['Thân','Dậu','Tuất']} };
    const tamHopMap = { 'ĐÔNG':['Hợi','Mão','Mùi'], 'TÂY':['Tị','Dậu','Sửu'], 'NAM':['Dần','Ngọ','Tuất'], 'BẮC':['Thân','Tý','Thìn'] };

    if (phuong) {
        [tuHopMap, sinhHopMap].forEach((map, idx) => {
            const data = map[phuong] || {can:[], chi:[]};
            const prefix = idx === 0 ? 'tuhop' : 'sinhhop';
            data.can.forEach(c => { choose.ngayCan.add(c); choose.gioCan.add(c); });
            data.chi.forEach(c => { choose.thangChi.add(c); choose.ngayChi.add(c); choose.gioChi.add(c); });
            setCell(`chon-${prefix}-thang-chi`, data.chi);
            setCell(`chon-${prefix}-ngay-can`, data.can);
            setCell(`chon-${prefix}-ngay-chi`, data.chi);
            setCell(`chon-${prefix}-gio-can`, data.can);
            setCell(`chon-${prefix}-gio-chi`, data.chi);
        });

        const tamHop = tamHopMap[phuong] || [];
        tamHop.forEach(c => { choose.thangChi.add(c); choose.ngayChi.add(c); choose.gioChi.add(c); });
        setCell('chon-tamhop-thang-chi', tamHop); setCell('chon-tamhop-ngay-chi', tamHop); setCell('chon-tamhop-gio-chi', tamHop);
    }

    if (toaInfo.huong && toaInfo.huong !== 'N/A') {
        const canBoLong = tamHopBoLongCanMap[toaInfo.huong];
        if (canBoLong) { choose.ngayCan.add(canBoLong); choose.gioCan.add(canBoLong); }
        const chiBoLong = new Set([...(tamHopBoLongChiMap['Ấn Cục'][toaInfo.huong]||[]), ...(tamHopBoLongChiMap['Tài Cục'][toaInfo.huong]||[]), ...(tamHopBoLongChiMap['Vượng Cục'][toaInfo.huong]||[])]);
        chiBoLong.forEach(c => { choose.thangChi.add(c); choose.ngayChi.add(c); choose.gioChi.add(c); });
    }

    // Kết luận
    const avoid_all_thang = new Set([...avoid_strict.thangChi, ...avoid_warning.thangChi]);
    const avoid_all_ngay = new Set([...avoid_strict.ngayChi, ...avoid_warning.ngayChi]);
    const avoid_all_gio = new Set([...avoid_strict.gioChi, ...avoid_warning.gioChi]);
    setCell('ketluan-tranh-thang-chi', [...avoid_all_thang]);
    setCell('ketluan-tranh-ngay-can', [...avoid_strict.ngayCan]);
    setCell('ketluan-tranh-ngay-chi', [...avoid_all_ngay]);
    setCell('ketluan-tranh-gio-can', [...avoid_strict.gioCan]);
    setCell('ketluan-tranh-gio-chi', [...avoid_all_gio]);

    const getFinalText = (chooseSet, avoidStrictSet, avoidWarningSet) => {
        const chinh = [...chooseSet].filter(c => !avoidStrictSet.has(c) && (!avoidWarningSet || !avoidWarningSet.has(c)));
        const pho = avoidWarningSet ? [...chooseSet].filter(c => !avoidStrictSet.has(c) && avoidWarningSet.has(c)) : [];
        if (chinh.length > 0 && pho.length > 0) return `CHÍNH: ${chinh.join(', ')}\n(Phó: ${pho.join(', ')} - Hóa Xung)`;
        if (chinh.length > 0) return chinh.join(', ');
        if (pho.length > 0) return `(Phó: ${pho.join(', ')} - Hóa Xung)`;
        return '';
    };

    setCell('ketluan-chon-thang-chi', getFinalText(choose.thangChi, avoid_strict.thangChi, avoid_warning.thangChi));
    setCell('ketluan-chon-ngay-can', getFinalText(choose.ngayCan, avoid_strict.ngayCan, null));
    setCell('ketluan-chon-ngay-chi', getFinalText(choose.ngayChi, avoid_strict.ngayChi, avoid_warning.ngayChi));
    setCell('ketluan-chon-gio-can', getFinalText(choose.gioCan, avoid_strict.gioCan, null));
    setCell('ketluan-chon-gio-chi', getFinalText(choose.gioChi, avoid_strict.gioChi, avoid_warning.gioChi));
}

// ---------- BẢNG TAM HỢP BỔ LONG ----------
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
            document.getElementById(`thbl-ancuc-${tf}-can`).innerText = canValue;
            document.getElementById(`thbl-taicuc-${tf}-can`).innerText = canValue;
            document.getElementById(`thbl-vuongcuc-${tf}-can`).innerText = canValue;
        }
        if (tf !== 'nam') {
            document.getElementById(`thbl-ancuc-${tf}-chi`).innerText = chiAnValue || '-';
            document.getElementById(`thbl-taicuc-${tf}-chi`).innerText = chiTaiValue || '-';
            document.getElementById(`thbl-vuongcuc-${tf}-chi`).innerText = chiVuongValue || '-';
        }
    });
}

// ---------- BẢNG THÁI DƯƠNG / THÁI ÂM ----------
function updateThaiDuongAmTable() {
    const toaDo = document.getElementById('toa-do').value;
    const toaInfo = toaDo ? findDataByDegree(toaDo) : null;
    const cells = {
        sonValue: document.getElementById('tdta-son-value'),
        tdDaoToa: document.getElementById('tdta-td-daotoa-data'),
        tdDaoHuong: document.getElementById('tdta-td-daohuong-data'),
        tdDaoTamHop: document.getElementById('tdta-td-daotamhob-data'),
        taDaoToa: document.getElementById('tdta-ta-daotoa-data'),
        taDaoHuong: document.getElementById('tdta-ta-daohuong-data')
    };
    Object.values(cells).forEach(cell => cell.innerText = '');
    const tietKhiHighlightSet = new Set();

    if (!toaInfo || !toaInfo.son || toaInfo.son === 'N/A') {
        cells.sonValue.innerText = 'N/A';
        return { son: null, tietKhiSet: tietKhiHighlightSet };
    }

    const son = toaInfo.son, data = THAI_DUONG_AM_DATA[son];
    cells.sonValue.innerText = son;
    if (data) {
        cells.tdDaoToa.innerText = data.tdDaoToa || '-';
        cells.tdDaoHuong.innerText = data.tdDaoHuong || '-';
        cells.tdDaoTamHop.innerText = data.tdDaoTamHop || '-';
        cells.taDaoToa.innerText = data.taDaoToa || '-';
        cells.taDaoHuong.innerText = data.taDaoHuong || '-';

        [data.tdDaoToa, data.tdDaoHuong, data.taDaoToa, data.taDaoHuong].forEach(tk => { if (tk) tietKhiHighlightSet.add(tk); });
        (data.tdDaoTamHop || '').split('\n').forEach(line => {
            const tk = line.split(' đáo ')[0];
            if (tk && TIET_KHI.includes(tk)) tietKhiHighlightSet.add(tk);
        });
    }
    return { son, tietKhiSet: tietKhiHighlightSet };
}

// ---------- RENDER KẾT QUẢ TỐI ƯU ----------
function renderToiUuResults(results, divId, label) {
    const resultsDiv = document.getElementById(divId);
    resultsDiv.innerHTML = '';
    if (!results || results.length === 0) {
        resultsDiv.innerHTML = `Không tìm thấy ${label} tối ưu.`;
        return;
    }
    let html = '';
    results.forEach(r => {
        const tooltipText = r.reasons.join('\n\n-- Hoặc --\n\n').replace(/"/g, '&quot;');
        const utText = r.prio === 1 ? '<span style="color:#d32f2f;font-weight:bold;">[ƯT1]</span> ' : '<span style="color:#1976d2;font-weight:bold;">[ƯT2]</span> ';
        html += `<div class="toi-uu-item" title="${tooltipText}">${utText}<b>${label} ${r.ngay}</b><small>`;
        r.reasons[0].split('\n').forEach(line => html += `${line}<br>`);
        html += `</small></div>`;
    });
    resultsDiv.innerHTML = html;
}

function renderChains(chains, divId, label) {
    const resultsDiv = document.getElementById(divId);
    resultsDiv.innerHTML = '';
    if (!chains || chains.length === 0) {
        resultsDiv.innerHTML = `Không tìm thấy chuỗi ${label} tối ưu.`;
        return;
    }
    let html = '';
    chains.forEach(c => {
        html += `<div class="toi-uu-item" title="${c.relDesc}"><b>[${c.totalScore}đ]</b> ${c.chainName}</div>`;
    });
    resultsDiv.innerHTML = html;
}

// ---------- FORMAT NỘI DUNG Ô GIỜ ----------
function formatHourCellContent(canChi, dayCan, dayTietKhi) {
    if (!canChi) return 'N/A';
    let html = `<div style="font-weight:bold;text-align:center;">${canChi}</div>`;
    html += '<b>1. Huyền Không Đại Quái</b><br>';
    const hqdqRaw = formatHccvAndQue(canChi);
    html += hqdqRaw.replace(/\n-----\n/g, '<br>-----<br>').replace(/\n/g, '<br>') + '<br>';

    html += '<b>2. Kỳ Môn Độn Giáp</b><br>Cục: (chưa tính)<br>Toạ: (chưa tính)<br>Hướng: (chưa tính)<br>';

    let quyNhanText = './.';
    if (dayCan && dayTietKhi && QUY_NHAN_DATA[dayCan] && QUY_NHAN_DATA[dayCan][dayTietKhi]) {
        const hourChi = canChi.split(' ')[1];
        const found = QUY_NHAN_DATA[dayCan][dayTietKhi][hourChi];
        if (found) quyNhanText = `<span class="quy-nhan-text">${found}</span>`;
    }
    html += `<b>3. Thiên Ất Quý Nhân</b><br>${quyNhanText}`;
    return html;
}

// ---------- GENERATE BẢNG NĂM ----------
async function generateYearTable() {
    const lunarYearToView = parseInt(document.getElementById('view-year').value);
    if (!lunarYearToView || isNaN(lunarYearToView)) return;

    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.style.display = 'flex';
    await new Promise(resolve => setTimeout(resolve, 10));

    const birthYear = document.getElementById('birth-year').value;
    const birthYearInfo = birthYear ? getYearCanChiInfo(parseInt(birthYear)) : {canChi: ''};
    const toaDo = document.getElementById('toa-do').value;
    const truToaInfo = toaDo ? findDataByDegree(toaDo) : null;
    const locationName = document.getElementById('location-check').value;
    const { tietKhiSet } = updateThaiDuongAmTable();

    const startLunarYearJDN = getLunarNewYearJDN(lunarYearToView);
    const endLunarYearJDN = getLunarNewYearJDN(lunarYearToView + 1) - 1;
    const finalStartDateJDN = startLunarYearJDN - 15;
    const finalEndDateJDN = endLunarYearJDN + 15;

    const tableBody = document.getElementById('table-body');
    let tableHtml = '';
    let stt = 1;

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
            const canNamTKIndex = (tietKhiYear + 6) % 10;
            const canThangDauIndex = [2, 4, 6, 8, 0][canNamTKIndex % 5];
            const canThangTKIndex = (canThangDauIndex + tietKhiMonthNum - 1) % 10;
            thangCanChiTK = THIEN_CAN[canThangTKIndex] + " " + tietKhiMonthChi[tietKhiMonthNum - 1];
        }

        const truNgayRaw = formatHccvAndQue(dayInfo.dayCanChi);
        const truNgayHtml = truNgayRaw.split('\n').map(line => {
            const match = line.match(/^(\d+)(\s*-.*)/);
            return match ? `<span class="hanh-number">${match[1]}</span>${match[2]}` : line;
        }).join('\n');

        const hanhTuoi = getHanhFromCanChi(birthYearInfo.canChi).join(',');
        const vanTuoi = getVanFromCanChi(birthYearInfo.canChi).join(',');
        const hanhToa = truToaInfo ? getHanhFromCanChi(truToaInfo.canChi).join(',') : '';
        const vanToa = truToaInfo ? getVanFromCanChi(truToaInfo.canChi).join(',') : '';
        const hanhNgay = getHanhFromCanChi(dayInfo.dayCanChi).join(',');
        const vanNgay = getVanFromCanChi(dayInfo.dayCanChi).join(',');
        const hanhThang = getHanhFromCanChi(thangCanChiTK).join(',');
        const vanThang = getVanFromCanChi(thangCanChiTK).join(',');
        const hanhNam = getHanhFromCanChi(namCanChiTK).join(',');
        const vanNam = getVanFromCanChi(namCanChiTK).join(',');
        const tietKhiClass = tietKhiSet.has(dayInfo.tietKhi) ? 'tiet-khi-highlight' : '';

        tableHtml += `<tr data-hanh-tuoi="${hanhTuoi}" data-hanh-toa="${hanhToa}" data-hanh-ngay="${hanhNgay}" data-hanh-thang="${hanhThang}" data-hanh-nam="${hanhNam}" data-van-tuoi="${vanTuoi}" data-van-toa="${vanToa}" data-van-ngay="${vanNgay}" data-van-thang="${vanThang}" data-van-nam="${vanNam}" data-canchi-tuoi="${birthYearInfo.canChi}" data-canchi-toa="${truToaInfo ? truToaInfo.canChi : ''}" data-canchi-ngay="${dayInfo.dayCanChi}" data-canchi-thang="${thangCanChiTK}" data-canchi-nam-tk="${namCanChiTK}">`;
        tableHtml += `<td data-col-idx="0">${stt}</td>`;
        tableHtml += `<td data-col-idx="1">${String(dayInfo.solarDay).padStart(2,'0')}/${String(dayInfo.solarMonth).padStart(2,'0')}/${dayInfo.solarYear}</td>`;
        tableHtml += `<td data-col-idx="2">${dayInfo.lunarDay}/${dayInfo.lunarMonth}${dayInfo.lunarLeap?' (nhuận)':''}/${dayInfo.lunarYear}</td>`;
        tableHtml += `<td data-col-idx="3">${dayInfo.lunarDay}</td>`;
        tableHtml += `<td data-col-idx="4">${dayInfo.lunarMonth}${dayInfo.lunarLeap?' (N)':''}</td>`;
        tableHtml += `<td data-col-idx="5">${dayInfo.lunarYear}</td>`;
        tableHtml += `<td data-col-idx="6">${dayInfo.dayCanChi}</td><td data-col-idx="7">${dayInfo.monthCanChi}</td><td data-col-idx="8">${dayInfo.yearCanChi}</td>`;
        tableHtml += `<td data-col-idx="9" class="${tietKhiClass}">${dayInfo.tietKhi}</td><td data-col-idx="10">${tietKhiMonth}</td>`;
        tableHtml += `<td data-col-idx="11">${thangCanChiTK}</td><td data-col-idx="12">${namCanChiTK}</td>`;
        tableHtml += `<td data-col-idx="13" style="color:red;">${solarNoonStr}</td><td data-col-idx="14">${dayOfWeek}</td>`;
        tableHtml += `<td data-col-idx="15" class="tru-cell">${formatHccvAndQue(birthYearInfo.canChi)}</td>`;
        tableHtml += `<td data-col-idx="16" class="tru-cell">${truToaInfo ? formatHccvAndQue(truToaInfo.canChi) : 'N/A\nN/A'}</td>`;
        tableHtml += `<td data-col-idx="17" class="tru-cell">${truNgayHtml}</td>`;
        tableHtml += `<td data-col-idx="18" class="tru-cell">${formatHccvAndQue(thangCanChiTK)}</td>`;
        tableHtml += `<td data-col-idx="19" class="tru-cell">${formatHccvAndQue(namCanChiTK)}</td>`;

        const hours = [23, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21];
        const dayCan = dayInfo.dayCanChi.split(" ")[0];
        for (let j = 0; j < hours.length; j++) {
            const hour = hours[j];
            const hourCanChiText = getHourCanChi(dayCan, hour);
            const hanhGio = getHanhFromCanChi(hourCanChiText).join(',');
            const vanGio = getVanFromCanChi(hourCanChiText).join(',');
            tableHtml += `<td class="hour-cell" data-col-idx="${20+j}" data-hanh-gio="${hanhGio}" data-van-gio="${vanGio}" data-canchi-gio="${hourCanChiText}">${formatHourCellContent(hourCanChiText, dayCan, dayInfo.tietKhi)}</td>`;
        }
        tableHtml += `</tr>`;
    }
    tableBody.innerHTML = tableHtml;
    loadingOverlay.style.display = 'none';
}

// ---------- CỘT TOGGLE ----------
function setupColumnToggles() {
    const toggleContainer = document.getElementById('column-toggle-controls');
    toggleContainer.innerHTML = '<span>Ẩn/Hiện Cột:</span>';
    document.querySelectorAll('#main-table thead [data-col-idx]').forEach(th => {
        const index = th.getAttribute('data-col-idx'), headerText = th.textContent.trim();
        if (!headerText || th.hasAttribute('colspan')) return;
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" id="toggle-col-${index}" data-col-index="${index}" checked> ${headerText}`;
        toggleContainer.appendChild(label);
        document.getElementById(`toggle-col-${index}`).addEventListener('change', applyColumnVisibility);
    });
}

function applyColumnVisibility() {
    const dynamicStyles = document.getElementById('dynamic-column-styles');
    let cssRules = '';
    document.querySelectorAll('#column-toggle-controls input[type="checkbox"]').forEach(cb => {
        if (!cb.checked) cssRules += `#main-table [data-col-idx="${cb.getAttribute('data-col-index')}"] { display: none; }\n`;
    });
    dynamicStyles.innerHTML = cssRules;

    let hkdqVisible = 0, gioVisible = 0;
    document.querySelectorAll('#main-table thead tr:nth-child(2) th[data-col-idx]').forEach(th => {
        const cb = document.getElementById(`toggle-col-${th.getAttribute('data-col-idx')}`);
        if (cb && cb.checked) {
            if (th.classList.contains('header-hkdq')) hkdqVisible++;
            else if (th.classList.contains('header-gio')) gioVisible++;
        }
    });
    const hkdqGroup = document.querySelector('#main-table thead .header-hkdq[colspan]');
    const gioGroup = document.querySelector('#main-table thead .header-gio[colspan]');
    if (hkdqGroup) { hkdqGroup.setAttribute('colspan', hkdqVisible || 1); hkdqGroup.style.display = hkdqVisible ? '' : 'none'; }
    if (gioGroup) { gioGroup.setAttribute('colspan', gioVisible || 1); gioGroup.style.display = gioVisible ? '' : 'none'; }
}

// ---------- FILTER ----------
function createFilterInputs() {
    const filterRow = document.getElementById('filter-row');
    filterRow.innerHTML = '';
    const totalCols = 32;
    const canChiCols = [6, 7, 8, 11, 12];
    const advancedFilterCols = [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];

    for (let i = 0; i < totalCols; i++) {
        const th = document.createElement('th');
        th.setAttribute('data-col-idx', i);
        if (advancedFilterCols.includes(i)) {
            th.innerHTML = `<div class="horizontal-filter-group"><input type="text" class="filter-input-hanh" data-column-filter="${i}" placeholder="H"><input type="text" class="filter-input-can-adv" data-column-filter="${i}" placeholder="C"><input type="text" class="filter-input-chi-adv" data-column-filter="${i}" placeholder="C"><input type="text" class="filter-input-van" data-column-filter="${i}" placeholder="V"></div>`;
        } else if (canChiCols.includes(i)) {
            th.innerHTML = `<div class="filter-group"><input type="text" class="filter-input-can" data-column-filter="${i}" placeholder="Can"><input type="text" class="filter-input-chi" data-column-filter="${i}" placeholder="Chi"></div>`;
        } else {
            th.innerHTML = `<input type="text" class="filter-input" data-column-filter="${i}" placeholder="Lọc...">`;
        }
        filterRow.appendChild(th);
    }
    document.querySelectorAll('#filter-row input').forEach(input => input.addEventListener('keyup', applyFilters));
    applyColumnVisibility();
}

function applyFilters() {
    const filters = {};
    const addFilter = (col, type, value) => { if (!filters[col]) filters[col] = {}; filters[col][type] = value; };

    document.querySelectorAll('#filter-row .filter-input').forEach(input => {
        if (input.value) addFilter(input.dataset.columnFilter, 'regular', input.value.toLowerCase().split(',').map(c => c.trim()).filter(c => c));
    });
    document.querySelectorAll('#filter-row .filter-input-can').forEach(input => {
        if (input.value) addFilter(input.dataset.columnFilter, 'can', input.value.toLowerCase().split(',').map(c => c.trim()).filter(c => c));
    });
    document.querySelectorAll('#filter-row .filter-input-chi').forEach(input => {
        if (input.value) addFilter(input.dataset.columnFilter, 'chi', input.value.toLowerCase().split(',').map(c => c.trim()).filter(c => c));
    });
    document.querySelectorAll('#filter-row .filter-input-hanh, #filter-row .filter-input-can-adv, #filter-row .filter-input-chi-adv, #filter-row .filter-input-van').forEach(input => {
        if (input.value) addFilter(input.dataset.columnFilter, input.classList.contains('filter-input-hanh') ? 'hanh' : input.classList.contains('filter-input-can-adv') ? 'can_adv' : input.classList.contains('filter-input-chi-adv') ? 'chi_adv' : 'van', input.value.split(',').map(c => c.trim()).filter(c => c));
    });

    const advancedFilterCols = [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
    const activeFilterKeys = Object.keys(filters);
    const hasFilters = activeFilterKeys.length > 0;

    document.querySelectorAll('#table-body tr').forEach(row => {
        let isVisible = true;
        if (hasFilters) {
            for (const colIndex of activeFilterKeys) {
                const filter = filters[colIndex];
                const cell = row.querySelector(`td[data-col-idx="${colIndex}"]`);
                if (!cell) { isVisible = false; break; }

                if (advancedFilterCols.includes(parseInt(colIndex))) {
                    const matches = cell.textContent.match(/(\d+) - ([^-]+)-([^-]+) - (\d+)/g) || [];
                    let matchFound = false;
                    const noAdvFilter = !filter.hanh && !filter.can_adv && !filter.chi_adv && !filter.van;
                    if (matches.length === 0 && noAdvFilter) matchFound = true;
                    else {
                        for (const m of matches) {
                            const [h, canChi, v] = m.split(' - ').map(p => p.trim());
                            const [can, chi] = canChi.split('-');
                            if ((!filter.hanh || filter.hanh.includes(h)) &&
                                (!filter.can_adv || filter.can_adv.some(c => can.toLowerCase().includes(c))) &&
                                (!filter.chi_adv || filter.chi_adv.some(c => chi.toLowerCase().includes(c))) &&
                                (!filter.van || filter.van.includes(v))) {
                                matchFound = true; break;
                            }
                        }
                    }
                    if (!matchFound) { isVisible = false; break; }
                } else {
                    const cellText = cell.textContent.toLowerCase().trim();
                    if (filter.regular && !filter.regular.some(c => cellText.includes(c))) { isVisible = false; break; }
                    if (filter.can || filter.chi) {
                        const [canPart = '', chiPart = ''] = cellText.split(' ');
                        if (filter.can && !filter.can.some(c => canPart.includes(c))) { isVisible = false; break; }
                        if (filter.chi && !filter.chi.some(c => chiPart.includes(c))) { isVisible = false; break; }
                    }
                }
            }
        }
        row.style.display = isVisible ? '' : 'none';
    });
}

// ---------- HRKĐQ ANALYSIS RENDER ----------
function renderHkdqAnalysis(ketQua) {
    let html = '<style>.hkdq-main-flex-container{display:flex;gap:10px;align-items:flex-start;}.hkdq-analysis-grid{flex:3;display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:5px;}.hkdq-analysis-summary{flex:2;}.hkdq-pillar-box{border:1px solid #e9ecef;padding:5px;border-radius:4px;background:#fff;text-align:center;font-size:11px;}.hkdq-pillar-title{font-weight:bold;font-size:1em;color:#0056b3;margin-bottom:4px;border-bottom:1px solid #eee;padding-bottom:2px;}.hkdq-stats{background:#f8f9fa;border:1px solid #dee2e6;border-radius:4px;padding:6px;margin-bottom:8px;font-size:11px;text-align:center;}.kxd-info{margin-top:4px;padding:4px;background:#fff8e1;border:1px solid #ffe082;border-radius:4px;font-size:9px;text-align:left;}.kxd-title{font-weight:bold;color:#d84315;border-bottom:1px dashed #ffe0b2;margin-bottom:3px;padding-bottom:2px;}.kxd-item{display:flex;justify-content:space-between;margin-bottom:2px;}.kxd-family{color:#e65100;font-weight:bold;}.kxd-badge{padding:1px 4px;border-radius:4px;font-weight:bold;}.kxd-badge.duong{background:#ffcdd2;color:#c62828;}.kxd-badge.am{background:#b3e5fc;color:#01579b;}.kxd-warning{margin-top:3px;font-style:italic;color:#c62828;}</style>';

    html += '<h6 style="margin:2px 0 5px 0;font-size:12px;color:#333;">Kết quả Phân tích HKĐQ</h6>';
    html += `<div class="hkdq-stats"><b>Thống kê:</b> Âm:<b>${ketQua.thongKeAmDuong['Âm']}</b>|Dương:<b>${ketQua.thongKeAmDuong['Dương']}</b>|PM:<b style="color:blue;">${ketQua.thongKeVaiTro['Phụ Mẫu']}</b>|TT:<b style="color:green;">${ketQua.thongKeVaiTro['Tử Tức']}</b>|KXĐ:<b style="color:red;">${ketQua.thongKeAmDuong['KXĐ']}</b></div>`;

    html += '<div class="hkdq-main-flex-container"><div class="hkdq-analysis-grid">';
    ['Trụ Tuổi','Trụ Tọa','Trụ Ngày','Trụ Tháng','Trụ Năm','Trụ Giờ'].forEach(tenTru => {
        html += `<div class="hkdq-pillar-box"><div class="hkdq-pillar-title">${tenTru.replace('Trụ ','')}</div>`;
        const kq = ketQua.ketQuaCacTru[tenTru];
        if (kq && kq.tenQue) {
            const tt = kq.thongTinDuocChon;
            html += `<span class="que-name" style="font-size:0.9em;font-weight:bold;display:block;">${kq.tenQue}</span>`;
            if (tt) {
                html += `<span class="am-duong ${tt.amDuong==='Dương'?'duong':'am'}" style="padding:2px 6px;font-size:0.85em;border-radius:10px;color:white;">${tt.amDuong}</span><br>`;
                html += `<small style="color:#666;line-height:1.1;font-size:9px;">${tt.vaiTroChiTiet}<br><em>${tt.giaDinh}</em></small>`;
            } else {
                html += '<span style="display:inline-block;background:#6c757d;color:white;padding:2px 6px;border-radius:10px;font-size:0.85em;">KXĐ</span>';
                if (kq.tatCaThongTin && kq.tatCaThongTin.length > 0) {
                    html += '<div class="kxd-info"><div class="kxd-title">Có thể thuộc:</div>';
                    kq.tatCaThongTin.forEach(info => {
                        html += `<div class="kxd-item"><span class="kxd-family">${info.giaDinh}</span><span class="kxd-badge ${info.amDuong==='Dương'?'duong':'am'}">${info.amDuong}</span></div>`;
                    });
                    html += '<div class="kxd-warning">⚠️ Khí tạp</div></div>';
                }
            }
        } else {
            html += '<span style="color:#999;font-style:italic;">-</span>';
        }
        html += '</div>';
    });
    html += '</div>';

    // Summary
    html += '<div class="hkdq-analysis-summary">';
    if (ketQua.canhBao.length > 0) {
        html += '<div class="warning-list">';
        ketQua.canhBao.forEach(cb => {
            const bg = cb.type === 'critical' ? '#f8d7da' : '#fff3cd';
            const color = cb.type === 'critical' ? '#721c24' : '#856404';
            html += `<div style="background:${bg};color:${color};border-left:3px solid ${cb.type==='critical'?'#dc3545':'#ffc107'};padding:4px 6px;margin:2px 0;font-size:10px;border-radius:3px;">${cb.type==='critical'?'🔴':'⚠️'}${cb.message}</div>`;
        });
        html += '</div>';
    } else {
        html += '<div style="background:#d4edda;color:#155724;border-left:3px solid #28a745;padding:4px 6px;margin:2px 0;font-size:10px;">✅ Không cảnh báo</div>';
    }

    const bgR = ketQua.ratingClass === 'rating-good' ? '#d4edda' : (ketQua.ratingClass === 'rating-medium' ? '#fff3cd' : '#f8d7da');
    const clR = ketQua.ratingClass === 'rating-good' ? '#155724' : (ketQua.ratingClass === 'rating-medium' ? '#856404' : '#721c24');
    html += `<div style="background:${bgR};color:${clR};text-align:center;font-weight:bold;margin-top:5px;padding:5px;font-size:11px;border-radius:4px;">🎯${ketQua.danhGia}</div>`;

    html += '<div style="background:#e8f5e8;border-left:3px solid #4caf50;padding:5px;margin-top:8px;font-size:11px;"><strong>👫 Huynh Đệ</strong><br>';
    html += ketQua.thongTinHuynhDe.tongHuynhDe > 0 ? `${ketQua.thongTinHuynhDe.chiTiet}` : '<em>Không có</em>';
    html += '</div>';

    if (ketQua.cacCapThatTinh && ketQua.cacCapThatTinh.length > 0) {
        html += '<div style="background:#fff3e0;border-left:3px solid #ff9800;padding:5px;font-size:11px;margin-top:5px;"><strong>🌟 Thất Tinh Đả Kiếp</strong><br>';
        ketQua.cacCapThatTinh.forEach(cap => html += `${cap.tru1.replace('Trụ ','')}-${cap.que1} ↔ ${cap.tru2.replace('Trụ ','')}-${cap.que2}<br>`);
        html += '</div>';
    }

    html += '</div></div>';
    return html;
}

function populateAnalysisTable(hourCell) {
    const row = hourCell.closest('tr');
    if (!row) return;

    const getHanh = attr => (row.dataset[attr] || '').split(',').map(Number).filter(n => !isNaN(n));
    const getVan = attr => (row.dataset[attr] || '').split(',').map(Number).filter(n => !isNaN(n));
    const getGio = attr => (hourCell.dataset[attr] || '').split(',').map(Number).filter(n => !isNaN(n));

    const hanh = { tuoi: getHanh('hanhTuoi'), toa: getHanh('hanhToa'), ngay: getHanh('hanhNgay'), thang: getHanh('hanhThang'), nam: getHanh('hanhNam'), gio: getGio('hanhGio') };
    const van = { tuoi: getVan('vanTuoi'), toa: getVan('vanToa'), ngay: getVan('vanNgay'), thang: getVan('vanThang'), nam: getVan('vanNam'), gio: getGio('vanGio') };

    document.getElementById('an-hanh-tuoi-toa').innerText = analyzeHanhPair(hanh.tuoi, hanh.toa);
    document.getElementById('an-hanh-tuoi-ngay').innerText = analyzeHanhPair(hanh.tuoi, hanh.ngay);
    document.getElementById('an-hanh-toa-ngay').innerText = analyzeHanhPair(hanh.toa, hanh.ngay);
    document.getElementById('an-hanh-ngay-gio').innerText = analyzeHanhPair(hanh.ngay, hanh.gio);
    document.getElementById('an-hanh-ngay-thang').innerText = analyzeHanhPair(hanh.ngay, hanh.thang);
    document.getElementById('an-hanh-ngay-nam').innerText = analyzeHanhPair(hanh.ngay, hanh.nam);
    document.getElementById('an-hanh-thang-nam').innerText = analyzeHanhPair(hanh.thang, hanh.nam);

    document.getElementById('an-van-tuoi-toa').innerText = analyzeVanPair(van.tuoi, van.toa);
    document.getElementById('an-van-tuoi-ngay').innerText = analyzeVanPair(van.tuoi, van.ngay);
    document.getElementById('an-van-toa-ngay').innerText = analyzeVanPair(van.toa, van.ngay);
    document.getElementById('an-van-ngay-gio').innerText = analyzeVanPair(van.ngay, van.gio);
    document.getElementById('an-van-ngay-thang').innerText = analyzeVanPair(van.ngay, van.thang);
    document.getElementById('an-van-ngay-nam').innerText = analyzeVanPair(van.ngay, van.nam);
    document.getElementById('an-van-thang-nam').innerText = analyzeVanPair(van.thang, van.nam);

    const getChi = canChiStr => { if (!canChiStr || typeof canChiStr !== 'string') return null; const parts = canChiStr.split(' '); return parts[1] || null; };
    const chi = { tuoi: getChi(row.dataset.canchiTuoi), toa: getChi(row.dataset.canchiToa), nam: getChi(row.dataset.canchiNamTk), thang: getChi(row.dataset.canchiThang), ngay: getChi(row.dataset.canchiNgay), gio: getChi(hourCell.dataset.canchiGio) };
    const checkXung = (c1, c2, cellId) => { document.getElementById(cellId).innerHTML = (c1 && c2 && LUC_XUNG_MAP[c1] === c2) ? '<span style="color:red;font-weight:bold;">Xung</span>' : '-'; };
    checkXung(chi.tuoi, chi.toa, 'an-canchi-tuoi-toa'); checkXung(chi.tuoi, chi.ngay, 'an-canchi-tuoi-ngay');
    checkXung(chi.toa, chi.ngay, 'an-canchi-toa-ngay'); checkXung(chi.ngay, chi.gio, 'an-canchi-ngay-gio');
    checkXung(chi.ngay, chi.thang, 'an-canchi-ngay-thang'); checkXung(chi.ngay, chi.nam, 'an-canchi-ngay-nam');
    checkXung(chi.thang, chi.nam, 'an-canchi-thang-nam');
    document.getElementById('an-ghi-chu').innerHTML = '-';

    const getFirstQue = canChi => { if (!canChi || canChi === 'N/A') return ''; const ques = huyenKhongQueMap[canChi]; return (ques && ques.length > 0) ? ques[0] : ''; };
    const hkdqInput = {
        truTuoi: getFirstQue(row.dataset.canchiTuoi), truToa: getFirstQue(row.dataset.canchiToa),
        truNgay: getFirstQue(row.dataset.canchiNgay), truThang: getFirstQue(row.dataset.canchiThang),
        truNam: getFirstQue(row.dataset.canchiNamTk), truGio: getFirstQue(hourCell.dataset.canchiGio)
    };
    document.getElementById('hkdq-analysis-cell').innerHTML = renderHkdqAnalysis(phanTichNhatKhoaDayDu(hkdqInput));
    document.getElementById('analysis-container').style.display = 'block';
}
