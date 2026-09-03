// ==========================================
// MOBILE-UI.JS – Giao diện & Xử lý Mobile (3 Tabs)
// ==========================================

window.MOBILE_STATE = {
    rangeMonths: 3,
    selectedMonths: Array.from({ length: 12 }, (_, i) => i + 1),
    inputData: null,
    allDates: [],
    filteredDates: [],
    displayCount: 15,
    selectedDays: {},
    selectedHours: {},
    filterState: null,
    chonCanArr: [], 
    chonChiArr: [],
    tranhCanArr: [],
    tranhChiArr: [],
    chonCanNgayGioArr: [],
    chonChiNgayGioArr: [],
    tranhCanNgayGioArr: [],
    tranhChiNgayGioArr: []
};

const MOBILE_STATE = window.MOBILE_STATE;

window.setRange = function setRange() {};
window.setOptLevel = function setOptLevel() {};

// ==================== TABS (BOTTOM NAV) ====================
window.switchTab = function switchTab(tabId) {
    const btn = document.getElementById('nav-' + tabId);
    if (btn && btn.classList.contains('disabled')) return;

    document.querySelectorAll('.m-screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.m-nav-btn').forEach(b => b.classList.remove('active'));

    document.getElementById('screen-' + tabId).classList.add('active');
    if (btn) btn.classList.add('active');
    
    window.scrollTo({top: 0, behavior: 'smooth'});
};

// ==================== HỖ TRỢ HIỂN THỊ QUẺ HKĐQ ====================
const TRIGRAM_MAP = {
    'Thiên': '☰', 'Trạch': '☱', 'Hỏa': '☲', 'Lôi': '☳',
    'Phong': '☴', 'Thủy': '☵', 'Sơn': '☶', 'Địa': '☷',
    'Càn': '☰', 'Đoài': '☱', 'Ly': '☲', 'Chấn': '☳',
    'Tốn': '☴', 'Khảm': '☵', 'Cấn': '☶', 'Khôn': '☷'
};

function getGuaStackHTML(queName, h, v) {
    if (!queName || queName === 'N/A') return '<span class="tc-empty">-</span>';
    let top = '', bottom = '';
    if (queName.startsWith('Thuần ')) {
        const t = queName.replace('Thuần ', '');
        top = TRIGRAM_MAP[t] || ''; bottom = TRIGRAM_MAP[t] || '';
    } else {
        const parts = queName.split(' ');
        top = TRIGRAM_MAP[parts[0]] || ''; bottom = TRIGRAM_MAP[parts[1]] || '';
    }
    return `<div class="m-gua-symbol-wrapper"><div class="m-gua-symbol-stack"><div class="m-gua-trigram">${top}</div><div class="m-gua-trigram">${bottom}</div></div><div class="m-gua-hanh" title="Hành">${h}</div><div class="m-gua-van" title="Vận">${v}</div></div>`;
}

function renderGuaVisual(canChi, hanhArr, vanArr) {
    const ques = (typeof huyenKhongQueMap !== 'undefined' && huyenKhongQueMap[canChi]) ? huyenKhongQueMap[canChi] : [];
    if (ques.length === 0) return '<span class="tc-empty">Không có Quẻ</span>';
    let html = '<div class="m-gua-container">';
    for (let i = 0; i < ques.length; i++) {
        const qName = ques[i];
        const h = hanhArr[i] || hanhArr[0] || '-';
        const v = vanArr[i] || vanArr[0] || '-';
        html += `<div class="m-gua-block">${getGuaStackHTML(qName, h, v)}<div class="m-gua-name">${qName.replace('Thuần ', '')}</div></div>`;
    }
    html += '</div>';
    return html;
}

// ==================== TOAST ====================
window.showToast = function showToast(msg, duration = 2500) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('show'), duration);
};

// ==================== ACCORDION / DROPDOWN ====================
window.toggleAccordion = function toggleAccordion(bodyId) {
    const accordions = ['acc-layer1', 'acc-layer2', 'acc-layer3'];
    const body = document.getElementById(bodyId);
    const chevron = document.getElementById(bodyId + '-chevron');
    if (!body || !chevron) return;
    const isHidden = body.style.display === 'none' || !body.style.display;
    accordions.forEach(id => {
        const b = document.getElementById(id), c = document.getElementById(id + '-chevron');
        if (b && c) { b.style.display = 'none'; c.textContent = '▶'; }
    });
    if (isHidden) { body.style.display = 'block'; chevron.textContent = '▼'; }
};

window.toggleGenericDropdown = function toggleGenericDropdown(bodyId, chevronId) {
    const body = document.getElementById(bodyId);
    const chevron = document.getElementById(chevronId);
    if (!body || !chevron) return;
    const isHidden = body.style.display === 'none';
    document.querySelectorAll('.m-dropdown-body').forEach(b => b.style.display = 'none');
    document.querySelectorAll('.m-dropdown-header .m-chevron').forEach(c => c.textContent = '▼');
    if (isHidden) { body.style.display = 'block'; chevron.textContent = '▲'; }
};

window.toggleSelectAllDropdown = function toggleSelectAllDropdown(containerId, btnEl) {
    const chips = document.querySelectorAll(`#${containerId} .m-pair-chip`);
    if (chips.length === 0) return;
    const allActive = Array.from(chips).every(c => c.classList.contains('active'));
    chips.forEach(c => {
        if (allActive) c.classList.remove('active'); else c.classList.add('active');
    });
    updateSelectAllBtn(containerId, btnEl);
    window.updateFilterBadge();
};

function updateSelectAllBtn(containerId, btnEl) {
    if (!btnEl) return;
    const chips = document.querySelectorAll(`#${containerId} .m-pair-chip`);
    const allActive = chips.length > 0 && Array.from(chips).every(c => c.classList.contains('active'));
    btnEl.textContent = allActive ? '❎ Bỏ chọn tất cả' : '✅ Chọn tất cả';
}

// ==================== CHỌN THÁNG ====================
const MOBILE_MONTH_NAMES = ['Tháng 1 (Giêng)', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11 (Một)', 'Tháng 12 (Chạp)'];

function buildMonthGrid() {
    const grid = document.getElementById('month-grid');
    if (!grid) return;
    const months = MOBILE_STATE.selectedMonths || [];
    const chonChis = MOBILE_STATE.chonChiArr || [];
    const tranhChis = MOBILE_STATE.tranhChiArr || [];

    grid.innerHTML = MOBILE_MONTH_NAMES.map((name, i) => {
        const m = i + 1; 
        const checked = months.includes(m);
        const chiOfMonth = tietKhiMonthChi[m - 1]; 
        let star = '';
        if (chonChis.includes(chiOfMonth)) {
            star = '<span class="m-chip-star" title="Nên chọn">🥇</span>';
        } else if (!tranhChis.includes(chiOfMonth)) {
            star = '<span class="m-chip-star" title="Bình thường">🥈</span>';
        }
        return `<label class="m-month-item ${checked ? 'month-checked' : ''}"><input type="checkbox" data-month="${m}" ${checked ? 'checked' : ''} onchange="toggleMonth(${m}, this)"><span>${star}${name}</span></label>`;
    }).join('');
    updateMonthAllBtn();
}

window.toggleMonth = function toggleMonth(m, el) {
    const set = new Set(MOBILE_STATE.selectedMonths || []);
    if (el.checked) set.add(m); else set.delete(m);
    MOBILE_STATE.selectedMonths = [...set].sort((a, b) => a - b);
    const item = el.closest('.m-month-item');
    if (item) item.classList.toggle('month-checked', el.checked);
    updateMonthAllBtn();
    window.updateFilterBadge();
};

window.toggleAllMonths = function toggleAllMonths() {
    if ((MOBILE_STATE.selectedMonths || []).length >= 12) {
        MOBILE_STATE.selectedMonths = [];
    } else {
        MOBILE_STATE.selectedMonths = Array.from({ length: 12 }, (_, i) => i + 1);
    }
    buildMonthGrid();
    window.updateFilterBadge();
};

function updateMonthAllBtn() {
    const btn = document.getElementById('btn-month-all');
    const textLabel = document.getElementById('month-dropdown-text');
    const count = (MOBILE_STATE.selectedMonths || []).length;
    if (btn) btn.textContent = count >= 12 ? '❎ Bỏ chọn tất cả' : '✅ Chọn tất cả';
    if (textLabel) textLabel.textContent = count === 12 ? 'Đã chọn 12 tháng' : `Đã chọn ${count} tháng`;
}

// ==================== HANDLE VIEW RESULT ====================
window.handleViewResult = async function handleViewResult() {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = 'flex';
    await new Promise(r => setTimeout(r, 30));

    try {
        const birthYear = parseInt(document.getElementById('m-birth-year').value);
        const toaDo = parseFloat(document.getElementById('m-toa-do').value);
        const viewYear = parseInt(document.getElementById('m-view-year').value);
        const locationName = document.getElementById('m-location').value.trim();

        if (isNaN(birthYear) || isNaN(toaDo) || isNaN(viewYear)) {
            window.showToast('⚠️ Vui lòng nhập đầy đủ: Năm sinh, Tọa độ, Năm xem');
            overlay.style.display = 'none';
            return;
        }

        const birthInfo = getYearCanChiInfo(birthYear);
        const toaInfo = findDataByDegree(toaDo);
        const yearInfo = getYearCanChiInfo(viewYear);
        const satsInfo = calculateAllYearlySats(viewYear);

        if (!toaInfo) {
            window.showToast('⚠️ Không tìm thấy dữ liệu cho độ số này');
            overlay.style.display = 'none';
            return;
        }

        const hanhTuoiArr = getHanhFromCanChi(birthInfo.canChi);
        const vanTuoiArr = getVanFromCanChi(birthInfo.canChi);
        const hanhToaArr = getHanhFromCanChi(toaInfo.canChi);
        const vanToaArr = getVanFromCanChi(toaInfo.canChi);
        const hanhNamArr = getHanhFromCanChi(yearInfo.canChi);
        const vanNamArr = getVanFromCanChi(yearInfo.canChi);

        MOBILE_STATE.selectedDays = {};
        MOBILE_STATE.selectedHours = {};
        MOBILE_STATE.filteredDates = [];
        MOBILE_STATE.displayCount = 15;

        MOBILE_STATE.inputData = {
            birthYear, toaDo, viewYear, locationName,
            birthInfo, toaInfo, yearInfo, satsInfo,
            hanhTuoiArr, vanTuoiArr, hanhToaArr, vanToaArr,
            hanhNamArr, vanNamArr
        };

        window.renderInputCards();
        renderTranhChonSummary(); 

        if (!MOBILE_STATE.filterUIInitialized) {
            createFilterUI();
            MOBILE_STATE.filterUIInitialized = true;
        } else {
            updateFilterUIWithData(); 
        }

        await generateAllDates();

        document.getElementById('input-results').style.display = 'block';
        document.getElementById('nav-filter').classList.remove('disabled');
        document.getElementById('nav-results').classList.remove('disabled');
        document.getElementById('results-container').innerHTML = '<div class="m-empty-state"><span style="font-size:48px;">🔍</span><p>Đã sẵn sàng! Hãy qua màn hình Bộ Lọc và nhấn "ÁP DỤNG".</p></div>';
        document.getElementById('results-bar').style.display = 'none';
        document.getElementById('btn-load-more').style.display = 'none';
        document.getElementById('result-count-badge').style.display = 'none';
        window.updateSelectedCount();

        window.showToast('✅ Đã nạp xong thông tin! Hãy nhấn chuyển sang Tab Bộ Lọc.');
        overlay.style.display = 'none';

    } catch (err) {
        console.error(err);
        overlay.style.display = 'none';
        window.showToast('❌ Lỗi: ' + err.message);
    }
};

// ==================== RENDER INPUT CARDS ====================
window.renderInputCards = function renderInputCards() {
    const d = MOBILE_STATE.inputData;
    if (!d) return;
    const canChi = d.birthInfo.canChi;
    document.getElementById('card-tuoi').innerHTML = `<div class="m-info-row"><span class="m-info-label">Can Chi</span><span class="m-info-value">${canChi}</span></div><div class="m-info-row"><span class="m-info-label">Lục Thập Nạp Âm</span><span class="m-info-value">${LUC_THAP_NAP_AM_MAP[canChi] || 'N/A'}</span></div><div class="m-info-row"><span class="m-info-label">Lạc Thư Nạp Âm</span><span class="m-info-value">${LAC_THU_NAP_AM_MAP[canChi] || 'N/A'}</span></div><div class="m-info-row m-info-row--col"><span class="m-info-label">Quẻ HKĐQ</span>${renderGuaVisual(canChi, d.hanhTuoiArr, d.vanTuoiArr)}</div>`;
    
    const toaInfo = d.toaInfo, tc = toaInfo.canChi;
    const huongPalaceName = huongToPalaceNameMap[toaInfo.huong];
    const phamNguHoang = (huongPalaceName === d.satsInfo.nguHoangNam || huongPalaceName === palaceOpposites[d.satsInfo.nguHoangNam]);
    const phamThaiTue = d.satsInfo.thaiTue.split(' - ').includes(toaInfo.son);
    const phamTamSat = getTamSatSonsForYear(d.satsInfo.yearChi).includes(toaInfo.son);
    const phamTuePha = d.satsInfo.tuePha.split(' - ').includes(toaInfo.son); 
    const phamBatSat = (BAT_SAT_NAM_CHI_MAP[d.satsInfo.yearChi] === toaInfo.huong);
    let p = '';
    p += `<div class="m-info-row"><span class="m-info-label">Trục Ngũ Hoàng</span><span class="m-info-value">${phamNguHoang ? '<span class="m-status-tag m-status-tag--pham">❌ PHẠM</span>' : '<span class="m-status-tag m-status-tag--khong-pham">✅ OK</span>'}</span></div>`;
    p += `<div class="m-info-row"><span class="m-info-label">Thái Tuế</span><span class="m-info-value">${phamThaiTue ? '<span class="m-status-tag m-status-tag--pham">❌ PHẠM</span>' : '<span class="m-status-tag m-status-tag--khong-pham">✅ OK</span>'}</span></div>`;
    p += `<div class="m-info-row"><span class="m-info-label">Xung Thái Tuế</span><span class="m-info-value">${phamTuePha ? '<span class="m-status-tag m-status-tag--pham">❌ PHẠM</span>' : '<span class="m-status-tag m-status-tag--khong-pham">✅ OK</span>'}</span></div>`;
    p += `<div class="m-info-row"><span class="m-info-label">Tam Sát</span><span class="m-info-value">${phamTamSat ? '<span class="m-status-tag m-status-tag--pham">❌ PHẠM</span>' : '<span class="m-status-tag m-status-tag--khong-pham">✅ OK</span>'}</span></div>`;
    p += `<div class="m-info-row"><span class="m-info-label">Bát Sát</span><span class="m-info-value">${phamBatSat ? '<span class="m-status-tag m-status-tag--pham">❌ PHẠM</span>' : '<span class="m-status-tag m-status-tag--khong-pham">✅ OK</span>'}</span></div>`;
    document.getElementById('card-toa').innerHTML = `<div class="m-info-row"><span class="m-info-label">Độ số</span><span class="m-info-value">${d.toaDo}°</span></div><div class="m-info-row"><span class="m-info-label">Sơn / Hướng</span><span class="m-info-value">${toaInfo.son} | ${toaInfo.huong}</span></div><div class="m-info-row"><span class="m-info-label">Phương</span><span class="m-info-value">${toaInfo.phuong}</span></div><div class="m-info-row"><span class="m-info-label">Can Chi</span><span class="m-info-value">${tc}</span></div><div class="m-info-row m-info-row--col"><span class="m-info-label">Quẻ HKĐQ</span>${renderGuaVisual(tc, d.hanhToaArr, d.vanToaArr)}</div>${p}`;
    
    const s = d.satsInfo, ycc = d.yearInfo.canChi;
    document.getElementById('card-nam').innerHTML = `<div class="m-info-row"><span class="m-info-label">Năm</span><span class="m-info-value text-gold">${d.viewYear} – ${ycc}</span></div><div class="m-info-row"><span class="m-info-label">Lục Thập Nạp Âm</span><span class="m-info-value">${LUC_THAP_NAP_AM_MAP[ycc] || 'N/A'}</span></div><div class="m-info-row"><span class="m-info-label">Lạc Thư Nạp Âm</span><span class="m-info-value">${LAC_THU_NAP_AM_MAP[ycc] || 'N/A'}</span></div><div class="m-info-row m-info-row--col"><span class="m-info-label">Quẻ HKĐQ</span>${renderGuaVisual(ycc, d.hanhNamArr, d.vanNamArr)}</div><div class="m-info-row"><span class="m-info-label">Ngũ Hoàng</span><span class="m-info-value text-warning">${s.nguHoangNam} – ${(palaceToSonMap[s.nguHoangNam]||[]).join(', ')}</span></div><div class="m-info-row"><span class="m-info-label">Nhị Hắc</span><span class="m-info-value">${s.nhiHacNam} – ${(palaceToSonMap[s.nhiHacNam]||[]).join(', ')}</span></div><div class="m-info-row"><span class="m-info-label">Thái Tuế</span><span class="m-info-value">${s.thaiTue}</span></div><div class="m-info-row"><span class="m-info-label">Xung Thái Tuế</span><span class="m-info-value text-danger">${s.tuePha}</span></div><div class="m-info-row"><span class="m-info-label">Tam Sát</span><span class="m-info-value">${getDetailedTamSatInfo(s.yearChi)}</span></div><div class="m-info-row"><span class="m-info-label">Bát Sát</span><span class="m-info-value text-danger">${BAT_SAT_NAM_CHI_MAP[s.yearChi] || 'Không có'}</span></div>`;
    
    let html = '<div class="m-table-wrap"><table class="m-mini-table"><thead><tr><th>Tháng</th>';
    for (let i = 1; i <= 12; i++) html += `<th>${i}</th>`;
    html += '</tr></thead><tbody><tr><td style="font-weight:700;color:#ffc107;">5H</td>';
    for (let i = 1; i <= 12; i++) html += `<td class="highlight-5">${s.monthlyStars[i].nguHoang}<br><small>${(palaceToSonMap[s.monthlyStars[i].nguHoang]||[]).join(',')}</small></td>`;
    html += '</tr><tr><td style="font-weight:700;">2H</td>';
    for (let i = 1; i <= 12; i++) html += `<td class="highlight-2">${s.monthlyStars[i].nhiHac}<br><small>${(palaceToSonMap[s.monthlyStars[i].nhiHac]||[]).join(',')}</small></td>`;
    html += '</tr></tbody></table></div>';
    document.getElementById('card-nguhoang-thang').innerHTML = html;

    const tda = THAI_DUONG_AM_DATA[toaInfo.son];
    document.getElementById('card-thaiduongam').innerHTML = tda ? `<div class="m-info-row"><span class="m-info-label">TỌA SƠN</span><span class="m-info-value text-gold">${toaInfo.son}</span></div><div class="m-info-row"><span class="m-info-label">☀ Thái Dương đáo tọa</span><span class="m-info-value text-warning">${tda.tdDaoToa || '-'}</span></div><div class="m-info-row"><span class="m-info-label">☀ Thái Dương đáo hướng</span><span class="m-info-value text-warning">${tda.tdDaoHuong || '-'}</span></div><div class="m-info-row"><span class="m-info-label">☀ Thái Dương đáo Tam Hợp</span><span class="m-info-value">${(tda.tdDaoTamHop || '-').replace(/\n/g, '<br>')}</span></div><div class="m-info-row"><span class="m-info-label">🌙 Thái Âm đáo tọa</span><span class="m-info-value text-info">${tda.taDaoToa || '-'}</span></div><div class="m-info-row"><span class="m-info-label">🌙 Thái Âm đáo hướng</span><span class="m-info-value text-info">${tda.taDaoHuong || '-'}</span></div>` : '<p class="text-muted">Không có dữ liệu cho sơn này</p>';
};

function fmtTcArr(arr) { return (!arr || arr.length === 0) ? '—' : arr.join(', '); }

function renderTranhChonSummary() {
    const d = MOBILE_STATE.inputData;
    const bodyEl = document.getElementById('tranchon-summary-body');
    if (!d || !bodyEl) return;
    const s = d.satsInfo, toaInfo = d.toaInfo, birthInfo = d.birthInfo;
    const phuong = toaInfo.phuong, huong = toaInfo.huong, huongKey = (typeof huongToPalaceNameMap !== 'undefined' && huongToPalaceNameMap[huong]) || huong;
    
    const tuePhaChi = s.tuePha ? s.tuePha.split(' - ')[1] || '' : '';
    const toaChi = (toaInfo.canChi || '').split(' ')[1] || '', xungToaChi = LUC_XUNG_MAP[toaChi] || '';
    const birthChi = (birthInfo.canChi || '').split(' ')[1] || '', xungTuoiChi = LUC_XUNG_MAP[birthChi] || '';
    const tamSatChi = getTamSatSonsForYear(s.yearChi).filter(x => DIA_CHI.includes(x));
    const batSatChi = BAT_SAT_HUONG_MAP[huongKey] || '';
    
    const nguHoangThangChi = [];
    for (let m = 1; m <= 12; m++) {
        if ([huongToPalaceNameMap[toaInfo.huong], palaceOpposites[huongToPalaceNameMap[toaInfo.huong]]].includes(s.monthlyStars[m].nguHoang)) {
            const mChi = tietKhiMonthChi[m - 1]; if (!nguHoangThangChi.includes(mChi)) nguHoangThangChi.push(mChi);
        }
    }
    const nguHoangNamChi = (palaceToSonMap[s.nguHoangNam] || []).filter(x => DIA_CHI.includes(x)).sort((a,b)=>(CHI_TO_INDEX[a]??99)-(CHI_TO_INDEX[b]??99));

    const tuHopMap = { 'ĐÔNG': { can: ['Giáp', 'Ất'], chi: ['Dần', 'Mão', 'Thìn'] }, 'TÂY': { can: ['Canh', 'Tân'], chi: ['Thân', 'Dậu', 'Tuất'] }, 'NAM': { can: ['Bính', 'Đinh'], chi: ['Tị', 'Ngọ', 'Mùi'] }, 'BẮC': { can: ['Nhâm', 'Quý'], chi: ['Hợi', 'Tý', 'Sửu'] } };
    const sinhHopMap = { 'ĐÔNG': { can: ['Nhâm', 'Quý'], chi: ['Hợi', 'Tý', 'Sửu'] }, 'TÂY': { can: ['Mậu', 'Kỷ'], chi: ['Thìn', 'Tuất', 'Sửu', 'Mùi'] }, 'NAM': { can: ['Giáp', 'Ất'], chi: ['Dần', 'Mão', 'Thìn'] }, 'BẮC': { can: ['Canh', 'Tân'], chi: ['Thân', 'Dậu', 'Tuất'] } };
    const tamHopMap = { 'ĐÔNG': ['Hợi', 'Mão', 'Mùi'], 'TÂY': ['Tị', 'Dậu', 'Sửu'], 'NAM': ['Dần', 'Ngọ', 'Tuất'], 'BẮC': ['Thân', 'Tý', 'Thìn'] };

    const tuHopData = tuHopMap[phuong] || { can: [], chi: [] };
    const sinhHopData = sinhHopMap[phuong] || { can: [], chi: [] };
    const tamHopData = tamHopMap[phuong] || [];
    const thblCan = tamHopBoLongCanMap[huongKey] || '', thblChiAn = tamHopBoLongChiMap['Ấn Cục'][huongKey] || [], thblChiTai = tamHopBoLongChiMap['Tài Cục'][huongKey] || [], thblChiVuong = tamHopBoLongChiMap['Vượng Cục'][huongKey] || [];

    const cell = (can, chi, chiRaw) => ({ can: can || [], chi: chi || [], chiRaw: chiRaw || null });
    const tranhRows = [
        { label: 'Ngũ Hoàng', nam: cell([], nguHoangNamChi), thang: cell([], nguHoangThangChi), ngay: cell([], []), gio: cell([], []) },
        { label: 'Xung Thái Tuế', nam: cell([], [tuePhaChi]), thang: cell([], [tuePhaChi]), ngay: cell([], []), gio: cell([], []) },
        { label: 'Tam Sát', nam: cell([], tamSatChi), thang: cell([], tamSatChi), ngay: cell([], tamSatChi), gio: cell([], tamSatChi) },
        { label: 'Bát Sát', nam: cell([], [batSatChi]), thang: cell([], [batSatChi]), ngay: cell([], [batSatChi]), gio: cell([], [batSatChi]) },
        { label: 'Xung Tọa', nam: cell([], [xungToaChi]), thang: cell([], [xungToaChi]), ngay: cell([], [xungToaChi]), gio: cell([], [xungToaChi]) },
        { label: 'Xung Tuổi', nam: cell([], [xungTuoiChi]), thang: cell([], [xungTuoiChi]), ngay: cell([], [xungTuoiChi]), gio: cell([], [xungTuoiChi]) },
    ];
    const chonRows = [
        { label: 'Tự Hợp', nam: cell([], []), thang: cell([], tuHopData.chi), ngay: cell(tuHopData.can, tuHopData.chi), gio: cell(tuHopData.can, tuHopData.chi) },
        { label: 'Sinh Hợp', nam: cell([], []), thang: cell([], sinhHopData.chi), ngay: cell(sinhHopData.can, sinhHopData.chi), gio: cell(sinhHopData.can, sinhHopData.chi) },
        { label: 'Tam Hợp', nam: cell([], []), thang: cell([], tamHopData), ngay: cell([], tamHopData), gio: cell([], tamHopData) },
        { label: 'Ấn Cục', nam: cell([], []), thang: cell([], thblChiAn), ngay: cell(thblCan ? [thblCan] : [], thblChiAn), gio: cell(thblCan ? [thblCan] : [], thblChiAn) },
        { label: 'Tài Cục', nam: cell([], []), thang: cell([], thblChiTai), ngay: cell(thblCan ? [thblCan] : [], thblChiTai), gio: cell(thblCan ? [thblCan] : [], thblChiTai) },
        { label: 'Vượng Cục', nam: cell([], []), thang: cell([], thblChiVuong), ngay: cell(thblCan ? [thblCan] : [], thblChiVuong), gio: cell(thblCan ? [thblCan] : [], thblChiVuong) },
    ];

    function collectColSets(rows, colName) {
        const canSet = new Set(), chiSet = new Set();
        rows.forEach(r => { (r[colName].can || []).forEach(c => c && canSet.add(c)); (r[colName].chi || []).forEach(c => c && chiSet.add(c)); });
        return { canSet, chiSet };
    }

    const cellHtml = (value, typeCls) => {
        if (!value || value.length === 0 || (value.length === 1 && value[0] === '')) return '<span class="tc-empty">—</span>';
        return `<span class="tc-value ${typeCls === 'tranh' ? 'tc-value--tranh' : 'tc-value--chon'}">${fmtTcArr(value)}</span>`;
    };

    let html = `<div class="m-tranchon-table-wrap"><table class="m-tranchon-table"><thead><tr><th class="col-type" rowspan="2">THẦN SÁT/ TAM HỢP</th><th colspan="2" class="col-year">NĂM</th><th colspan="2" class="col-month">THÁNG</th><th colspan="2" class="col-day">NGÀY</th><th colspan="2" class="col-hour">GIỜ</th></tr><tr><th>CAN</th><th>CHI</th><th>CAN</th><th>CHI</th><th>CAN</th><th>CHI</th><th>CAN</th><th>CHI</th></tr></thead><tbody>`;
    function renderCellPair(cc, type) { return `<td>${cellHtml(cc.can, type)}</td>${cc.chiRaw != null ? `<td class="tc-multi">${cc.chiRaw}</td>` : `<td>${cellHtml(cc.chi, type)}</td>`}`; }
    function renderSummaryRows(rows, type) {
        let out = '';
        rows.forEach(r => {
            out += `<tr class="${type === 'tranh' ? 'tc-tranh' : 'tc-chon'}"><td class="col-type" style="color:${type === 'tranh' ? 'var(--danger)' : 'var(--success)'};">${type === 'tranh' ? '🔴' : '🟢'} ${r.label}</td>`;
            ['nam', 'thang', 'ngay', 'gio'].forEach(col => { out += renderCellPair(r[col], type); });
            out += `</tr>`;
        }); return out;
    }
    html += renderSummaryRows(tranhRows, 'tranh') + renderSummaryRows(chonRows, 'chon');

    const cols = ['nam', 'thang', 'ngay', 'gio'], ketLuanTranh = {}, ketLuanChon = {};
    const allGlobalTranhCan = new Set(), allGlobalTranhChi = new Set(), allGlobalChonCanRaw = new Set(), allGlobalChonChiRaw = new Set();
    const tNgayGio = { canSet: new Set(), chiSet: new Set() }, cNgayGioRaw = { canSet: new Set(), chiSet: new Set() };

    cols.forEach(col => {
        const t = collectColSets(tranhRows, col), cRaw = collectColSets(chonRows, col);
        ketLuanTranh[col] = cell([...t.canSet], [...t.chiSet]);
        ketLuanChon[col] = cell([...cRaw.canSet].filter(x => !t.canSet.has(x)), [...cRaw.chiSet].filter(x => !t.chiSet.has(x)));
        t.canSet.forEach(v => allGlobalTranhCan.add(v)); t.chiSet.forEach(v => allGlobalTranhChi.add(v));
        cRaw.canSet.forEach(v => allGlobalChonCanRaw.add(v)); cRaw.chiSet.forEach(v => allGlobalChonChiRaw.add(v));
        if (['ngay', 'gio'].includes(col)) {
            t.canSet.forEach(v => tNgayGio.canSet.add(v)); t.chiSet.forEach(v => tNgayGio.chiSet.add(v));
            cRaw.canSet.forEach(v => cNgayGioRaw.canSet.add(v)); cRaw.chiSet.forEach(v => cNgayGioRaw.chiSet.add(v));
        }
    });

    MOBILE_STATE.tranhCanArr = [...allGlobalTranhCan]; MOBILE_STATE.tranhChiArr = [...allGlobalTranhChi];
    MOBILE_STATE.chonCanArr = [...allGlobalChonCanRaw].filter(x => !allGlobalTranhCan.has(x)); MOBILE_STATE.chonChiArr = [...allGlobalChonChiRaw].filter(x => !allGlobalTranhChi.has(x));
    MOBILE_STATE.tranhCanNgayGioArr = [...tNgayGio.canSet]; MOBILE_STATE.tranhChiNgayGioArr = [...tNgayGio.chiSet];
    MOBILE_STATE.chonCanNgayGioArr = [...cNgayGioRaw.canSet].filter(x => !tNgayGio.canSet.has(x)); MOBILE_STATE.chonChiNgayGioArr = [...cNgayGioRaw.chiSet].filter(x => !tNgayGio.chiSet.has(x));

    html += `<tr class="tc-summary-row tc-tranh"><td class="col-type" style="color:var(--danger);">🚫 NÊN TRÁNH</td>`;
    cols.forEach(col => { html += renderCellPair(ketLuanTranh[col], 'tranh'); });
    html += `</tr><tr class="tc-summary-row tc-chon"><td class="col-type" style="color:var(--success);">✅ NÊN CHỌN</td>`;
    cols.forEach(col => { html += renderCellPair(ketLuanChon[col], 'chon'); });
    html += `</tr></tbody></table></div>`;
    bodyEl.innerHTML = html;
    document.getElementById('tranchon-summary').style.display = 'block';
}

// ==================== CREATE FILTER UI ====================
function createFilterUI() {
    buildMonthGrid(); 
    createFilterCanChi(); 
    createFilterTietKhi(); 
    createFilterHanhVanPairs();
    createFilterHanhVanPillar();
    createFilterChiPairs();
    createFilterVaiTro();
    createFilterGiaDinh();
    createFilterThatTinh();
    createFilterHuynhDe();
}

function updateFilterUIWithData() { buildMonthGrid(); createFilterCanChi(); createFilterTietKhi(); }

function createFilterCanChi() {
    const canContainer = document.getElementById('filter-can'), chiContainer = document.getElementById('filter-chi');
    const chonCans = MOBILE_STATE.chonCanNgayGioArr || [], chonChis = MOBILE_STATE.chonChiNgayGioArr || [], tranhCans = MOBILE_STATE.tranhCanNgayGioArr || [], tranhChis = MOBILE_STATE.tranhChiNgayGioArr || [];

    if (canContainer) {
        canContainer.innerHTML = THIEN_CAN.map(c => {
            let star = '';
            if (chonCans.includes(c)) star = '<span class="m-chip-star" title="Nên chọn">🥇</span>';
            else if (!tranhCans.includes(c)) star = '<span class="m-chip-star" title="Bình thường">🥈</span>';
            return `<span class="m-chip" data-can="${c}" onclick="window.toggleChip(this)">${star}${c}</span>`;
        }).join('');
    }
    if (chiContainer) {
        chiContainer.innerHTML = DIA_CHI.map(c => {
            let star = '';
            if (chonChis.includes(c)) star = '<span class="m-chip-star" title="Nên chọn">🥇</span>';
            else if (!tranhChis.includes(c)) star = '<span class="m-chip-star" title="Bình thường">🥈</span>';
            return `<span class="m-chip" data-chi="${c}" onclick="window.toggleChip(this)">${star}${c}</span>`;
        }).join('');
    }
}

window.toggleAllCanChi = function toggleAllCanChi() {
    const chips = document.querySelectorAll('#filter-can .m-chip, #filter-chi .m-chip');
    if (chips.length === 0) return;
    const allActive = Array.from(chips).every(c => c.classList.contains('active'));
    chips.forEach(c => { if (allActive) c.classList.remove('active'); else c.classList.add('active'); });
    updateCanChiAllBtn(); window.updateFilterBadge();
};

function updateCanChiAllBtn() {
    const btn = document.getElementById('btn-canchi-all');
    if (!btn) return;
    const chips = document.querySelectorAll('#filter-can .m-chip, #filter-chi .m-chip');
    const allActive = chips.length > 0 && Array.from(chips).every(c => c.classList.contains('active'));
    btn.textContent = allActive ? '❎ Bỏ chọn tất cả' : '✅ Chọn tất cả';
    const activeCount = document.querySelectorAll('#filter-can .m-chip.active, #filter-chi .m-chip.active').length;
    const textEl = document.getElementById('canchi-dropdown-text');
    if (textEl) textEl.textContent = activeCount > 0 ? `Đã chọn ${activeCount} Can/Chi` : 'Lọc Can & Chi';
}

function createFilterTietKhi() {
    const container = document.getElementById('filter-tietkhi');
    const relevantSet = new Set();
    if (MOBILE_STATE.inputData) {
        const data = THAI_DUONG_AM_DATA[MOBILE_STATE.inputData.toaInfo.son];
        if (data) {
            [data.tdDaoToa, data.tdDaoHuong, data.taDaoToa, data.taDaoHuong].forEach(tk => { if (tk && TIET_KHI.includes(tk)) relevantSet.add(tk); });
            if (data.tdDaoTamHop) data.tdDaoTamHop.split('\n').forEach(line => { const tk = line.split(' đáo ')[0]; if (tk && TIET_KHI.includes(tk)) relevantSet.add(tk); });
        }
    }
    if (container) {
        container.innerHTML = TIET_KHI.map(tk => {
            const star = relevantSet.has(tk) ? '<span class="m-chip-star" title="Thái Dương/Thái Âm đáo tọa">🥇</span>' : '';
            return `<span class="m-chip" data-tietkhi="${tk}" onclick="window.toggleChip(this)">${star}${tk}</span>`;
        }).join('');
    }
    updateTietKhiAllBtn();
}

window.toggleAllTietKhi = function toggleAllTietKhi() {
    const chips = document.querySelectorAll('#filter-tietkhi .m-chip');
    const allActive = chips.length > 0 && Array.from(chips).every(c => c.classList.contains('active'));
    chips.forEach(c => { if (allActive) c.classList.remove('active'); else c.classList.add('active'); });
    updateTietKhiAllBtn(); window.updateFilterBadge();
};

function updateTietKhiAllBtn() {
    const btn = document.getElementById('btn-tietkhi-all');
    if (!btn) return;
    const chips = document.querySelectorAll('#filter-tietkhi .m-chip');
    const all = chips.length > 0 && Array.from(chips).every(c => c.classList.contains('active'));
    btn.textContent = all ? '❎ Bỏ chọn tất cả' : '✅ Chọn tất cả';
    const activeCount = document.querySelectorAll('#filter-tietkhi .m-chip.active').length;
    const textEl = document.getElementById('tietkhi-dropdown-text');
    if (textEl) textEl.textContent = activeCount > 0 ? `Đã chọn ${activeCount} Tiết khí` : 'Lọc Tiết Khí';
}

function createFilterHanhVanPairs() {
    const hanhContainer = document.getElementById('filter-hanh-pairs'), vanContainer = document.getElementById('filter-van-pairs');
    const orderedPairs = [ { key: 'tuoi-toa', label: '🥈 Tuổi ↔ Tọa' }, { key: 'tuoi-ngay', label: '🥇 Tuổi ↔ Ngày' }, { key: 'toa-ngay', label: '🥇 Tọa ↔ Ngày' }, { key: 'gio-ngay', label: '🥇 Giờ ↔ Ngày' }, { key: 'ngay-thang', label: '🥇 Ngày ↔ Tháng' }, { key: 'ngay-nam', label: '🥈 Ngày ↔ Năm' }, { key: 'thang-nam', label: '🥇 Tháng ↔ Năm' } ];
    const hanhRelations = ['Cùng Quái', 'Hợp Ngũ', 'Hợp Thập', 'Hợp Thập Ngũ', 'Hà Đồ', 'Sinh Nhập', 'Khắc Nhập'];
    const vanRelations = ['Cùng Quái', 'Hợp Ngũ', 'Hợp Thập', 'Hợp Thập Ngũ', 'Hà Đồ', 'Điên Đảo Ai Tinh'];
    function buildPairHTML(prefix, relations) {
        return orderedPairs.map(p => {
            const bodyId = `dropdown-${prefix}-${p.key}-body`, chevId = `dropdown-${prefix}-${p.key}-chev`;
            return `<div class="m-dropdown"><div class="m-dropdown-header" onclick="window.toggleGenericDropdown('${bodyId}', '${chevId}')"><span>${p.label}</span><span class="m-chevron" id="${chevId}">▼</span></div><div class="m-dropdown-body" id="${bodyId}" style="display:none;"><button type="button" class="m-select-all-btn" onclick="window.toggleSelectAllDropdown('${bodyId}', this)">✅ Chọn tất cả</button><div class="m-pair-chips">${relations.map(r => `<span class="m-pair-chip" data-pair="${prefix}-${p.key}" data-rel="${r}" onclick="window.togglePairChip(this); updateSelectAllBtn('${bodyId}', this.parentNode.previousElementSibling)">${r}</span>`).join('')}</div></div></div>`;
        }).join('');
    }
    if (hanhContainer) hanhContainer.innerHTML = buildPairHTML('hanh', hanhRelations);
    if (vanContainer) vanContainer.innerHTML = buildPairHTML('van', vanRelations);
}

function createFilterHanhVanPillar() {
    const container = document.getElementById('filter-hanhvan-pillar');
    if (!container) return;
    const pillars = [ { id: 'tuoi', label: 'Trụ Tuổi' }, { id: 'toa', label: 'Trụ Tọa' }, { id: 'gio', label: 'Trụ Giờ' }, { id: 'ngay', label: 'Trụ Ngày' }, { id: 'thang', label: 'Trụ Tháng' }, { id: 'nam', label: 'Trụ Năm' } ];
    container.innerHTML = pillars.map(p => {
        const bodyId = `dropdown-pillar-${p.id}-body`, chevId = `dropdown-pillar-${p.id}-chev`;
        return `<div class="m-dropdown"><div class="m-dropdown-header" onclick="window.toggleGenericDropdown('${bodyId}', '${chevId}')"><span>${p.label}</span><span class="m-chevron" id="${chevId}">▼</span></div><div class="m-dropdown-body" id="${bodyId}" style="display:none;"><button type="button" class="m-select-all-btn" onclick="window.toggleSelectAllDropdown('${bodyId}', this)">✅ Chọn tất cả</button><div style="display:flex;gap:8px;flex-wrap:wrap;"><span style="font-size:0.7rem;color:var(--text-muted);width:100%;">Hành:</span>${[1,2,3,4,5,6,7,8,9].map(i => `<span class="m-pair-chip" data-hanh-pillar="${p.id}" data-hanh-val="${i}" onclick="window.togglePairChip(this); updateSelectAllBtn('${bodyId}', this.parentNode.previousElementSibling.previousElementSibling)">${i}</span>`).join('')}</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;"><span style="font-size:0.7rem;color:var(--text-muted);width:100%;">Vận:</span>${[1,2,3,4,5,6,7,8,9].map(i => `<span class="m-pair-chip" data-van-pillar="${p.id}" data-van-val="${i}" onclick="window.togglePairChip(this); updateSelectAllBtn('${bodyId}', this.parentNode.previousElementSibling.previousElementSibling.previousElementSibling)">${i}</span>`).join('')}</div></div></div>`;
    }).join('');
}

function createFilterChiPairs() {
    const chiContainer = document.getElementById('filter-chi-pairs');
    if (!chiContainer) return;
    const orderedPairs = [ { key: 'tuoi-toa', label: '🥈 Tuổi ↔ Tọa' }, { key: 'tuoi-ngay', label: '🥇 Tuổi ↔ Ngày' }, { key: 'toa-ngay', label: '🥇 Tọa ↔ Ngày' }, { key: 'gio-ngay', label: '🥇 Giờ ↔ Ngày' }, { key: 'ngay-thang', label: '🥇 Ngày ↔ Tháng' }, { key: 'ngay-nam', label: '🥈 Ngày ↔ Năm' }, { key: 'thang-nam', label: '🥇 Tháng ↔ Năm' } ];
    chiContainer.innerHTML = orderedPairs.map(p => {
        const bodyId = `dropdown-chi-${p.key}-body`, chevId = `dropdown-chi-${p.key}-chev`;
        return `<div class="m-dropdown"><div class="m-dropdown-header" onclick="window.toggleGenericDropdown('${bodyId}', '${chevId}')"><span>${p.label}</span><span class="m-chevron" id="${chevId}">▼</span></div><div class="m-dropdown-body" id="${bodyId}" style="display:none;"><button type="button" class="m-select-all-btn" onclick="window.toggleSelectAllDropdown('${bodyId}', this)">✅ Chọn tất cả</button><div class="m-pair-chips">${['Không Xung', 'Tam Hợp', 'Nhị Hợp'].map(r => `<span class="m-pair-chip" data-pair="chi-${p.key}" data-rel="${r}" onclick="window.togglePairChip(this); updateSelectAllBtn('${bodyId}', this.parentNode.previousElementSibling)">${r}</span>`).join('')}</div></div></div>`;
    }).join('');
}

function createFilterVaiTro() {
    const container = document.getElementById('filter-vaitro');
    if (container) container.innerHTML = [ { id: 'hkdq-phaiCoPhuMau', label: 'Phải có Phụ Mẫu (≥1 trụ)' }, { id: 'hkdq-phaiCoTuTuc', label: 'Phải có Tử Tức (≥1 trụ)' }, { id: 'hkdq-duPhuMauTuTuc', label: 'Có đủ Phụ Mẫu + Tử Tức' }, { id: 'hkdq-khongKXD', label: 'Không trụ nào KXĐ (tạp khí)' }, { id: 'hkdq-canBangAmDuong', label: 'Cân bằng Âm Dương (không Cô Âm/Dương)' }, { id: 'hkdq-canBangTamTai', label: 'Tam Tài (Tuổi-Tọa-Ngày) cân bằng' } ].map(item => `<div class="m-filter-item"><input type="checkbox" id="${item.id}" onchange="window.updateFilterBadge()"><label for="${item.id}">${item.label}</label></div>`).join('');
}

function createFilterGiaDinh() {
    const container = document.getElementById('filter-giadinh');
    if (!container) return;
    const families = [ { name: 'Càn - Khôn', roles: ['Cha', 'Mẹ', 'Nam', 'Nữ'] }, { name: 'Khảm - Ly', roles: ['Cha', 'Mẹ', 'Nam', 'Nữ'] }, { name: 'Chấn - Tốn', roles: ['Cha', 'Mẹ', 'Nam', 'Nữ'] }, { name: 'Cấn - Đoài', roles: ['Cha', 'Mẹ', 'Nam', 'Nữ'] }, { name: 'Bĩ - Thái', roles: ['Cha', 'Mẹ', 'Nam', 'Nữ'] }, { name: 'Ký Tế - Vị Tế', roles: ['Cha', 'Mẹ', 'Nam', 'Nữ'] }, { name: 'Hằng - Ích', roles: ['Cha', 'Mẹ', 'Nam', 'Nữ'] }, { name: 'Tổn - Hàm', roles: ['Cha', 'Mẹ', 'Nam', 'Nữ'] } ];
    container.innerHTML = families.map(f => `<div class="m-giadinh-row"><span class="m-giadinh-name">${f.name}</span><div class="m-giadinh-chips">${f.roles.map(r => `<span class="m-pair-chip" data-giadinh="${f.name}" data-role="${r}" onclick="window.togglePairChip(this)">${r}</span>`).join('')}</div></div>`).join('');
}

function createFilterThatTinh() {
    const container = document.getElementById('filter-thattinh');
    if (container) container.innerHTML = `<div class="m-filter-item"><input type="checkbox" id="hkdq-phaiCoThatTinh" onchange="window.updateFilterBadge()"><label for="hkdq-phaiCoThatTinh">Phải có Thất Tinh Đả Kiếp (≥1 cặp)</label></div><div class="m-filter-item"><input type="checkbox" id="hkdq-khongThatTinh" onchange="window.updateFilterBadge()"><label for="hkdq-khongThatTinh">Không có Thất Tinh</label></div>`;
}

function createFilterHuynhDe() {
    const container = document.getElementById('filter-huynhde');
    if (container) container.innerHTML = `<div class="m-filter-item"><input type="checkbox" id="hkdq-phaiCoHuynhDe" onchange="window.updateFilterBadge()"><label for="hkdq-phaiCoHuynhDe">Phải có Huynh Đệ (≥2 Tử Tức cùng gia đình)</label></div><div class="m-filter-item"><input type="checkbox" id="hkdq-khongHuynhDe" onchange="window.updateFilterBadge()"><label for="hkdq-khongHuynhDe">Không có Huynh Đệ</label></div>`;
}

// ==================== CHIP TOGGLE ====================
window.toggleChip = function toggleChip(chip) { chip.classList.toggle('active'); window.updateFilterBadge(); updateTietKhiAllBtn(); updateCanChiAllBtn(); };
window.togglePairChip = function togglePairChip(chip) { chip.classList.toggle('active'); window.updateFilterBadge(); };

// ==================== GET FILTER STATE ====================
function getFilterState() {
    const state = { tietKhi: [], can: [], chi: [], hanhPairs: {}, vanPairs: {}, chiPairs: {}, hanhPillar: {}, vanPillar: {}, hkdq: {}, giadinh: {} };
    document.querySelectorAll('#filter-tietkhi .m-chip.active').forEach(chip => state.tietKhi.push(chip.dataset.tietkhi));
    document.querySelectorAll('#filter-can .m-chip.active').forEach(chip => state.can.push(chip.dataset.can));
    document.querySelectorAll('#filter-chi .m-chip.active').forEach(chip => state.chi.push(chip.dataset.chi));

    ['hanh-pairs', 'van-pairs', 'chi-pairs'].forEach(group => {
        document.querySelectorAll(`#filter-${group} .m-pair-chip.active`).forEach(chip => {
            const prefix = group.split('-')[0] + '-';
            const pair = chip.dataset.pair.replace(prefix, '');
            if (!state[`${group.split('-')[0]}Pairs`][pair]) state[`${group.split('-')[0]}Pairs`][pair] = [];
            state[`${group.split('-')[0]}Pairs`][pair].push(chip.dataset.rel);
        });
    });
    
    document.querySelectorAll('.m-pair-chip.active[data-hanh-pillar]').forEach(chip => { const p = chip.dataset.hanhPillar; if (!state.hanhPillar[p]) state.hanhPillar[p] = []; state.hanhPillar[p].push(parseInt(chip.dataset.hanhVal)); });
    document.querySelectorAll('.m-pair-chip.active[data-van-pillar]').forEach(chip => { const p = chip.dataset.vanPillar; if (!state.vanPillar[p]) state.vanPillar[p] = []; state.vanPillar[p].push(parseInt(chip.dataset.vanVal)); });

    ['hkdq-phaiCoPhuMau', 'hkdq-phaiCoTuTuc', 'hkdq-duPhuMauTuTuc', 'hkdq-khongKXD', 'hkdq-canBangAmDuong', 'hkdq-canBangTamTai', 'hkdq-phaiCoThatTinh', 'hkdq-khongThatTinh', 'hkdq-phaiCoHuynhDe', 'hkdq-khongHuynhDe'].forEach(id => { const el = document.getElementById(id); if (el) state.hkdq[id.replace('hkdq-', '')] = el.checked; });
    document.querySelectorAll('.m-pair-chip.active[data-giadinh]').forEach(chip => { const gd = chip.dataset.giadinh; if (!state.giadinh[gd]) state.giadinh[gd] = []; state.giadinh[gd].push(chip.dataset.role); });
    
    return state;
}

function countActiveFilters(state) {
    let count = state.tietKhi.length + state.can.length + state.chi.length;
    if (state.hanhPairs) count += Object.keys(state.hanhPairs).length;
    if (state.vanPairs) count += Object.keys(state.vanPairs).length;
    if (state.chiPairs) count += Object.keys(state.chiPairs).length;
    if (state.hanhPillar) count += Object.keys(state.hanhPillar).length;
    if (state.vanPillar) count += Object.keys(state.vanPillar).length;
    if (state.hkdq) count += Object.values(state.hkdq).filter(Boolean).length;
    if (state.giadinh) count += Object.keys(state.giadinh).length;
    return count;
}

function updateLayerBadge(id, count) {
    const badge = document.getElementById(id);
    if (!badge) return;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
}

// [MỚI] Bật/tắt chấm trạng thái cho từng mục con trong tab Bộ Lọc — sáng (xanh) khi mục đó
// đang có tiêu chí lọc được áp dụng, tắt khi không có gì được chọn ở mục đó.
function setDot(id, on) {
    const dot = document.getElementById(id);
    if (dot) dot.classList.toggle('on', !!on);
}
function updateFilterDots(state) {
    const monthsSelected = (MOBILE_STATE.selectedMonths || []).length;
    setDot('dot-1a', monthsSelected > 0 && monthsSelected < 12);
    setDot('dot-1b', state.can.length > 0 || state.chi.length > 0);
    setDot('dot-1c', state.tietKhi.length > 0);
    setDot('dot-2a', Object.keys(state.hanhPairs || {}).length > 0);
    setDot('dot-2b', Object.keys(state.vanPairs || {}).length > 0);
    setDot('dot-2c', Object.keys(state.hanhPillar || {}).length > 0 || Object.keys(state.vanPillar || {}).length > 0);
    setDot('dot-2d', Object.keys(state.chiPairs || {}).length > 0);
    const h = state.hkdq || {};
    setDot('dot-3a', h.phaiCoPhuMau || h.phaiCoTuTuc || h.duPhuMauTuTuc || h.khongKXD || h.canBangAmDuong || h.canBangTamTai);
    setDot('dot-3b', Object.keys(state.giadinh || {}).length > 0);
    setDot('dot-3c', h.phaiCoThatTinh || h.khongThatTinh);
    setDot('dot-3e', h.phaiCoHuynhDe || h.khongHuynhDe);
}

window.updateFilterBadge = function updateFilterBadge() {
    const state = getFilterState();
    const total = countActiveFilters(state);
    const badgeTotal = document.getElementById('filter-badge-total');
    if (badgeTotal) { badgeTotal.textContent = total; badgeTotal.style.display = total > 0 ? 'inline-flex' : 'none'; }
    updateLayerBadge('badge-layer1', state.tietKhi.length + state.can.length + state.chi.length);
    let l2 = 0;
    if (state.hanhPairs) l2 += Object.keys(state.hanhPairs).length;
    if (state.vanPairs) l2 += Object.keys(state.vanPairs).length;
    if (state.chiPairs) l2 += Object.keys(state.chiPairs).length;
    if (state.hanhPillar) l2 += Object.keys(state.hanhPillar).length;
    if (state.vanPillar) l2 += Object.keys(state.vanPillar).length;
    updateLayerBadge('badge-layer2', l2);
    let l3 = 0;
    if (state.hkdq) l3 += Object.values(state.hkdq).filter(Boolean).length;
    if (state.giadinh) l3 += Object.keys(state.giadinh).length;
    updateLayerBadge('badge-layer3', l3);
    updateFilterDots(state);
};

// ==================== GENERATE ALL DATES ====================
async function generateAllDates() {
    const d = MOBILE_STATE.inputData;
    if (!d) return;
    const startJDN = getLunarNewYearJDN(d.viewYear) - 15;
    const endJDN = getLunarNewYearJDN(d.viewYear + 1) - 1 + 15;
    const selected = new Set(MOBILE_STATE.selectedMonths || []);
    const dates = [];
    for (let jdn = startJDN; jdn <= endJDN; jdn++) {
        const info = getDateInfo(jdn);
        if (selected.has(info.lunarMonth)) dates.push(info);
    }
    MOBILE_STATE.allDates = dates;
}

// ==============================================
// HKĐQ HELPERS
// ==============================================
function layDanhSachQueMobile(canChi) { return (!canChi || canChi === 'N/A') ? [] : (typeof huyenKhongQueMap !== 'undefined' && huyenKhongQueMap[canChi]) || []; }
function giaDinhCuaQueMobile(tenQue) { return typeof timThongTinQue !== 'function' ? [] : [...new Set(timThongTinQue(tenQue).map(tt => tt.giaDinh))]; }
function thuThapHoBangChungMobile(tenTruHienTai, tatCaQueTheoTru) {
    const ho = new Set();
    Object.entries(tatCaQueTheoTru).forEach(([tenTru, dsQue]) => {
        if (tenTru === tenTruHienTai) return;
        (dsQue || []).forEach(q => { giaDinhCuaQueMobile(q).forEach(gd => ho.add(gd)); });
    });
    return ho;
}
function chonQuePhanTichMobile(canChi, hoBangChung) {
    const ques = layDanhSachQueMobile(canChi);
    if (ques.length === 0) return { queChon: '', queConLai: [] };
    const quePhuMau = ques.find(q => typeof timThongTinQue === 'function' && timThongTinQue(q).some(tt => tt.vaiTroTongQuat === 'Phụ Mẫu'));
    if (quePhuMau) return { queChon: quePhuMau, queConLai: ques.filter(q => q !== quePhuMau) };
    if (ques.length === 1) return { queChon: ques[0], queConLai: [] };
    const unique = ques.filter(q => { const matched = giaDinhCuaQueMobile(q).filter(gd => hoBangChung && hoBangChung.has(gd)); return matched.length === 1; });
    const queChon = unique.length === 1 ? unique[0] : ques[0];
    return { queChon, queConLai: ques.filter(q => q !== queChon) };
}
function hasHkdqFilters(state) {
    if (!state || (!state.hkdq && !state.giadinh)) return false;
    if (state.hkdq && Object.values(state.hkdq).some(Boolean)) return true;
    if (state.giadinh && Object.keys(state.giadinh).length > 0) return true;
    return false;
}

// ==============================================
// [MỚI] HỆ THỐNG A (DUY NHẤT) — Gán Gia Đình/Vai Trò
// ==============================================
// Trước đây bảng chi tiết dùng ttList[0] (dòng đầu tiên trong dữ liệu gốc, không có căn cứ
// gì) trong khi Tầng 3 (Bộ Lọc) lại dùng đúng logic Thầy Tiến (quanXetQueTheoNguCanh) — 2 nơi
// có thể ra kết quả khác nhau cho cùng 1 quẻ "lưỡng họ". Nay hợp nhất: TOÀN BỘ nơi hiển thị chỉ
// dùng đúng 1 hệ logic này (Phụ Mẫu ưu tiên tuyệt đối; Tử Tức chỉ nhận họ khi có bằng chứng
// huyết thống DUY NHẤT từ các trụ còn lại; ngược lại → KXĐ).
//
// Vì bảng hiển thị 5 trụ nền (Tuổi/Tọa/Ngày/Tháng/Năm) dùng CHUNG 1 cột cho mọi khung Giờ trong
// ngày (không lặp lại theo từng giờ), 5 trụ nền được giải với nhau TRƯỚC (không cần Giờ). Riêng
// Trụ Giờ — vì mỗi khung giờ có 1 cột riêng — được giải RIÊNG cho từng giờ, dùng chính 5 trụ nền
// đã giải làm bằng chứng huyết thống. Tầng 3 (Bộ Lọc) vẫn tiếp tục dùng bản phân tích đủ 6 trụ/giờ
// như cũ (phanTichNhatKhoaDayDu) — cùng thuật toán gốc, chỉ khác phạm vi bằng chứng của Giờ.
function resolveTruNen(d, dayInfo) {
    const canChiMap = { 'Trụ Tuổi': d.birthInfo.canChi, 'Trụ Tọa': d.toaInfo.canChi, 'Trụ Ngày': dayInfo.dayCanChi, 'Trụ Tháng': dayInfo.thangCanChiTK, 'Trụ Năm': dayInfo.namCanChiTK };
    const tatCaQueTheoTru = {};
    Object.entries(canChiMap).forEach(([tenTru, cc]) => { tatCaQueTheoTru[tenTru] = layDanhSachQueMobile(cc); });
    const queChinh = {};
    Object.entries(canChiMap).forEach(([tenTru, cc]) => {
        queChinh[tenTru] = chonQuePhanTichMobile(cc, thuThapHoBangChungMobile(tenTru, tatCaQueTheoTru)).queChon;
    });
    const ketQua = {};
    Object.keys(canChiMap).forEach(tenTru => {
        const tenQue = queChinh[tenTru];
        ketQua[tenTru] = tenQue
            ? quanXetQueTheoNguCanh(tenQue, tenTru, queChinh, tatCaQueTheoTru)
            : taoKetQuaQue({ thongTinDuocChon: null, trangThai: 'Không tìm thấy', tatCaThongTin: [], bangChungGiaDinh: [], lyDoKXD: 'khong_tim_thay' });
    });
    return { canChiMap, queChinh, tatCaQueTheoTru, ketQua };
}
function resolveTruGio(hourCanChiText, truNen) {
    const hoBangChung = new Set();
    Object.values(truNen.tatCaQueTheoTru).forEach(ques => ques.forEach(q => giaDinhCuaQueMobile(q).forEach(gd => hoBangChung.add(gd))));
    const tenQue = chonQuePhanTichMobile(hourCanChiText, hoBangChung).queChon;
    if (!tenQue) {
        return { que: '', ketQua: taoKetQuaQue({ thongTinDuocChon: null, trangThai: 'Không tìm thấy', tatCaThongTin: [], bangChungGiaDinh: [], lyDoKXD: 'khong_tim_thay' }) };
    }
    const tatCaCacTru = { ...truNen.queChinh, 'Trụ Giờ': tenQue };
    const tatCaQueTheoTru = { ...truNen.tatCaQueTheoTru, 'Trụ Giờ': layDanhSachQueMobile(hourCanChiText) };
    return { que: tenQue, ketQua: quanXetQueTheoNguCanh(tenQue, 'Trụ Giờ', tatCaCacTru, tatCaQueTheoTru) };
}

// ==============================================
// [MỚI] GHI CHÚ THẤT TINH ĐẢ KIẾP & XUNG CHI GIỮA CÁC CẶP TRỤ
// ==============================================
const TEN_TRU_NGAN = { 'Trụ Tuổi': 'Tuổi', 'Trụ Tọa': 'Tọa', 'Trụ Ngày': 'Ngày', 'Trụ Tháng': 'Tháng', 'Trụ Năm': 'Năm', 'Trụ Giờ': 'Giờ' };
// Ghi chú giữa 5 trụ nền với nhau — tính 1 lần/ngày, dùng chung cho mọi cột Giờ.
function computeCanhBaoTruNen(truNen) {
    const tenTrus = Object.keys(truNen.queChinh);
    const tt = {}, xung = {};
    tenTrus.forEach(t => { tt[t] = []; xung[t] = []; });
    for (let i = 0; i < tenTrus.length; i++) {
        for (let j = i + 1; j < tenTrus.length; j++) {
            const t1 = tenTrus[i], t2 = tenTrus[j];
            const q1 = truNen.queChinh[t1], q2 = truNen.queChinh[t2];
            if (q1 && q2 && HKDQ_MAP_THAT_TINH[q1] && HKDQ_MAP_THAT_TINH[q1].includes(q2)) { tt[t1].push(t2); tt[t2].push(t1); }
            const c1 = (truNen.canChiMap[t1] || '').split(' ')[1], c2 = (truNen.canChiMap[t2] || '').split(' ')[1];
            if (c1 && c2 && LUC_XUNG_MAP[c1] === c2) { xung[t1].push(t2); xung[t2].push(t1); }
        }
    }
    return { tt, xung };
}
// Ghi chú riêng của 1 khung Giờ với từng trụ nền.
function computeCanhBaoGio(gioQue, gioChi, truNen) {
    const tt = [], xung = [];
    Object.keys(truNen.queChinh).forEach(tenTru => {
        const qNen = truNen.queChinh[tenTru];
        if (gioQue && qNen && HKDQ_MAP_THAT_TINH[gioQue] && HKDQ_MAP_THAT_TINH[gioQue].includes(qNen)) tt.push(TEN_TRU_NGAN[tenTru]);
        const cNen = (truNen.canChiMap[tenTru] || '').split(' ')[1];
        if (gioChi && cNen && LUC_XUNG_MAP[cNen] === gioChi) xung.push(TEN_TRU_NGAN[tenTru]);
    });
    return { tt, xung };
}
function renderCanhBaoNoteHtml(tt, xung) {
    if ((!tt || tt.length === 0) && (!xung || xung.length === 0)) return '';
    const parts = [];
    if (tt && tt.length) parts.push(`<span class="tc-note tc-note--tt">⚡ TTĐK: ${tt.join(', ')}</span>`);
    if (xung && xung.length) parts.push(`<span class="tc-note tc-note--xung">⚔ Xung: ${xung.join(', ')}</span>`);
    return `<div class="m-hkdq-note">${parts.join('')}</div>`;
}

// ==============================================
// [MỚI] THIÊN ẤT QUÝ NHÂN CHO TRỤ GIỜ
// ==============================================
// Tra theo Can Ngày + Tiết Khí hiện hành → xem Chi của khung Giờ có phải Quý Nhân không.
function getThienAtQuyNhan(dayCan, tietKhi, gioChi) {
    const bang = QUY_NHAN_DATA[dayCan] && QUY_NHAN_DATA[dayCan][tietKhi];
    return (bang && bang[gioChi]) || null; // "Dương QN" | "Âm QN" | null
}

function checkHkdqConditions(ketQua, state) {
    const h = state.hkdq || {}, gd = state.giadinh || {};
    if (h.phaiCoPhuMau && ketQua.thongKeVaiTro['Phụ Mẫu'] < 1) return false;
    if (h.phaiCoTuTuc && ketQua.thongKeVaiTro['Tử Tức'] < 1) return false;
    if (h.duPhuMauTuTuc && (ketQua.thongKeVaiTro['Phụ Mẫu'] < 1 || ketQua.thongKeVaiTro['Tử Tức'] < 1)) return false;
    if (h.khongKXD && ketQua.thongKeAmDuong['KXĐ'] > 0) return false;
    if (h.canBangAmDuong && ((ketQua.thongKeAmDuong['Dương'] > 0 && ketQua.thongKeAmDuong['Âm'] === 0) || (ketQua.thongKeAmDuong['Âm'] > 0 && ketQua.thongKeAmDuong['Dương'] === 0))) return false;
    if (h.canBangTamTai) {
        let soAmTT = 0, soDuongTT = 0;
        ['Trụ Tuổi', 'Trụ Tọa', 'Trụ Ngày'].forEach(tenTru => {
            const kq = ketQua.ketQuaCacTru[tenTru];
            if (kq && kq.thongTinDuocChon && kq.trangThai !== 'KXĐ') {
                if (kq.thongTinDuocChon.amDuong === 'Âm') soAmTT++;
                if (kq.thongTinDuocChon.amDuong === 'Dương') soDuongTT++;
            }
        });
        if ((soDuongTT > 0 && soAmTT === 0) || (soAmTT > 0 && soDuongTT === 0)) return false;
    }
    if (h.phaiCoThatTinh && ketQua.cacCapThatTinh.length === 0) return false;
    if (h.khongThatTinh && ketQua.cacCapThatTinh.length > 0) return false;
    if (h.phaiCoHuynhDe && ketQua.thongKeVaiTro['Huynh Đệ'] < 2) return false;
    if (h.khongHuynhDe && ketQua.thongKeVaiTro['Huynh Đệ'] > 0) return false;

    if (Object.keys(gd).length > 0) {
        const familyRolesFound = {};
        Object.values(ketQua.ketQuaCacTru).forEach(kq => {
            if (kq && kq.thongTinDuocChon && kq.trangThai !== 'KXĐ') {
                const fam = kq.thongTinDuocChon.giaDinh, vt = kq.thongTinDuocChon.vaiTroChiTiet;
                if (!familyRolesFound[fam]) familyRolesFound[fam] = new Set();
                if (vt.includes('Cha') || vt.includes('Mẹ')) familyRolesFound[fam].add(vt.includes('Cha') ? 'Cha' : 'Mẹ');
                else if (vt.includes('Nam')) familyRolesFound[fam].add('Nam');
                else if (vt.includes('Nữ')) familyRolesFound[fam].add('Nữ');
            }
        });
        for (const [famKey, requiredRoles] of Object.entries(gd)) {
            const found = familyRolesFound[famKey];
            if (!found || !requiredRoles.some(r => found.has(r))) return false;
        }
    }
    return true;
}

// ==================== ĐIỂM TỔNG TƯƠNG TÁC GIỮA CÁC TRỤ ====================
// [MỚI] Tính điểm (Hành + Vận) giữa 2 trụ, dựa trên cùng logic đã dùng cho Tầng 2 (Bộ Lọc)
// và bộ Tối Ưu (optimizer.js): checkHanhRelations + checkDirectedRelations cho Hành,
// checkVanRelations cho Vận, lấy điểm cao nhất mỗi loại rồi cộng lại.
function computePairScoreHV(hanh1, van1, hanh2, van2) {
    let hanhRels = [], vanRels = [];
    if (hanh1 && hanh1.length && hanh2 && hanh2.length) {
        for (const h1 of hanh1) for (const h2 of hanh2) {
            hanhRels.push(...checkHanhRelations(h1, h2), ...checkDirectedRelations(h1, h2));
        }
    }
    if (van1 && van1.length && van2 && van2.length) {
        for (const v1 of van1) for (const v2 of van2) {
            vanRels.push(...checkVanRelations(v1, v2));
        }
    }
    return getBestScore(hanhRels) + getBestScore(vanRels);
}
// Cộng điểm của TẤT CẢ các cặp trụ trong danh sách (mỗi cặp chỉ tính 1 lần)
function computeTotalPillarScore(pillars) {
    let total = 0;
    for (let i = 0; i < pillars.length; i++) {
        for (let j = i + 1; j < pillars.length; j++) {
            total += computePairScoreHV(pillars[i].hanh, pillars[i].van, pillars[j].hanh, pillars[j].van);
        }
    }
    return total;
}

// ==================== KHUNG GIỜ CHÍNH XÁC THEO CHÍNH NGỌ ====================
// [MỚI] 12 giờ Chi mặc định lệch theo mốc Chính Ngọ = 12:00 (VD: Thìn 07:00-09:00).
// Nếu Chính Ngọ thực tế lệch khỏi 12:00 bao nhiêu phút, toàn bộ 12 khung giờ dịch đúng bấy nhiêu phút.
function getHourRangeLabel(nominalStartHour, chinhNgoStr) {
    let offsetMin = 0;
    if (chinhNgoStr && /^\d{2}:\d{2}$/.test(chinhNgoStr)) {
        const [hh, mm] = chinhNgoStr.split(':').map(Number);
        offsetMin = (hh * 60 + mm) - 12 * 60;
    }
    const fmt = (totalMin) => {
        const m = ((totalMin % 1440) + 1440) % 1440;
        return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    };
    const startTotal = nominalStartHour * 60 + offsetMin;
    return `${fmt(startTotal)}-${fmt(startTotal + 120)}`;
}

// ==================== CHI RELATIONS HELPERS ====================
const LUC_HOP_MAP = { 'Tý': 'Sửu', 'Sửu': 'Tý', 'Dần': 'Hợi', 'Hợi': 'Dần', 'Mão': 'Tuất', 'Tuất': 'Mão', 'Thìn': 'Dậu', 'Dậu': 'Thìn', 'Tị': 'Thân', 'Thân': 'Tị', 'Ngọ': 'Mùi', 'Mùi': 'Ngọ' };
function isLucHop(c1, c2) { return LUC_HOP_MAP[c1] === c2; }
function isTamHop(c1, c2) {
    const groups = [['Thân', 'Tý', 'Thìn'], ['Dần', 'Ngọ', 'Tuất'], ['Hợi', 'Mão', 'Mùi'], ['Tị', 'Dậu', 'Sửu']];
    for (const g of groups) { if (g.includes(c1) && g.includes(c2)) return true; }
    return false;
}
function getChiForPillar(pillarKey, d, dayInfo, hourCanChiText) {
    let canChi = null;
    switch(pillarKey) {
        case 'tuoi': canChi = d.birthInfo.canChi; break;
        case 'toa': canChi = d.toaInfo.canChi; break;
        case 'ngay': canChi = dayInfo.dayCanChi; break;
        case 'thang': canChi = dayInfo.thangCanChiTK; break;
        case 'nam': canChi = dayInfo.namCanChiTK; break;
        case 'gio': canChi = hourCanChiText; break;
    }
    return (!canChi || canChi === 'N/A') ? null : canChi.split(' ')[1];
}
function getHanhVanForPillar(pillarKey, hanhOrVan, d, dayInfo, hourCanChiText) {
    let canChi = null;
    switch(pillarKey) {
        case 'tuoi': canChi = d.birthInfo.canChi; break;
        case 'toa': canChi = d.toaInfo.canChi; break;
        case 'ngay': canChi = dayInfo.dayCanChi; break;
        case 'thang': canChi = dayInfo.thangCanChiTK; break;
        case 'nam': canChi = dayInfo.namCanChiTK; break;
        case 'gio': canChi = hourCanChiText; break;
    }
    if (!canChi || canChi === 'N/A') return [];
    return hanhOrVan === 'hanh' ? getHanhFromCanChi(canChi) : getVanFromCanChi(canChi);
}

// ==================== APPLY ALL FILTERS ====================
window.applyAllFilters = function applyAllFilters() {
    if (!MOBILE_STATE.inputData) { window.showToast('⚠️ Vui lòng nhập thông tin và nhấn "XEM THÔNG TIN" trước'); return; }
    if (!window._userTriggeredApply) { window.updateFilterBadge(); return; }

    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = 'flex';

    requestAnimationFrame(async () => {
        try {
            await generateAllDates();
            const d = MOBILE_STATE.inputData, filterState = getFilterState();
            MOBILE_STATE.filterState = filterState;

            // [MỚI] Nạp/cache kinh độ địa điểm 1 lần duy nhất cho cả đợt lọc,
            // để mỗi ngày sau đó chỉ cần tính Giờ Chính Ngọ đồng bộ (getSolarNoonSync), không gọi lại API.
            if (MOBILE_STATE.allDates.length > 0) {
                await getSolarNoon(MOBILE_STATE.allDates[0].jdn, d.locationName);
            }

            const filtered = [], needHkdqCheck = hasHkdqFilters(filterState);
            const toaInfo = d.toaInfo, birthInfo = d.birthInfo;

            for (const dateInfo of MOBILE_STATE.allDates) {
                const dayCan = dateInfo.dayCanChi.split(' ')[0], dayChi = dateInfo.dayCanChi.split(' ')[1];
                if (filterState.tietKhi.length > 0 && !filterState.tietKhi.includes(dateInfo.tietKhi)) continue;

                const lapXuanJDN = getLapXuanJDN(dateInfo.solarYear);
                const tietKhiYear = dateInfo.jdn < lapXuanJDN ? dateInfo.solarYear - 1 : dateInfo.solarYear;
                const namCanChiTK = getYearCanChiInfo(tietKhiYear).canChi;
                const tietKhiMonthNum = parseInt(getTietKhiMonth(dateInfo.tietKhi));
                let thangCanChiTK = 'N/A';
                if (!isNaN(tietKhiMonthNum)) {
                    const canNamTKIndex = (tietKhiYear + 6) % 10;
                    const canThangDauIndex = [2, 4, 6, 8, 0][canNamTKIndex % 5];
                    const canThangTKIndex = (canThangDauIndex + tietKhiMonthNum - 1) % 10;
                    thangCanChiTK = THIEN_CAN[canThangTKIndex] + " " + tietKhiMonthChi[tietKhiMonthNum - 1];
                }
                dateInfo.thangCanChiTK = thangCanChiTK; dateInfo.namCanChiTK = namCanChiTK;
                // [SỬA] Gán "Tháng TK" (tháng theo Tiết Khí) để hiển thị đúng ở thẻ ngày, thay vì để undefined.
                dateInfo.tietKhiMonth = isNaN(tietKhiMonthNum) ? 'N/A' : tietKhiMonthNum;
                // [MỚI] Giờ Chính Ngọ (giờ mặt trời qua đỉnh) của riêng ngày này, theo địa điểm đã nhập.
                dateInfo.chinhNgo = getSolarNoonSync(dateInfo.jdn);

                // [MỚI] Điểm tổng tương tác 5 trụ Tuổi-Tọa-Ngày-Tháng-Năm (không tính Giờ), hiển thị ở tiêu đề mỗi ngày.
                const pillar5Base = [
                    { hanh: d.hanhTuoiArr, van: d.vanTuoiArr },
                    { hanh: d.hanhToaArr, van: d.vanToaArr },
                    { hanh: getHanhFromCanChi(dateInfo.dayCanChi), van: getVanFromCanChi(dateInfo.dayCanChi) },
                    { hanh: getHanhFromCanChi(thangCanChiTK), van: getVanFromCanChi(thangCanChiTK) },
                    { hanh: getHanhFromCanChi(namCanChiTK), van: getVanFromCanChi(namCanChiTK) }
                ];
                dateInfo.pillarScore5 = computeTotalPillarScore(pillar5Base);

                // [MỚI] Giải Gia Đình/Vai Trò 5 trụ nền theo đúng Hệ thống A (dùng chung cho mọi cột Giờ trong ngày)
                const truNen = resolveTruNen(d, dateInfo);
                const canhBaoTruNen = computeCanhBaoTruNen(truNen);
                dateInfo._truNen = truNen;
                dateInfo._canhBaoTruNen = canhBaoTruNen;

                const passingHours = [];
                const hours = [ { chi: 'Tý', hour: 23 }, { chi: 'Sửu', hour: 1 }, { chi: 'Dần', hour: 3 }, { chi: 'Mão', hour: 5 }, { chi: 'Thìn', hour: 7 }, { chi: 'Tị', hour: 9 }, { chi: 'Ngọ', hour: 11 }, { chi: 'Mùi', hour: 13 }, { chi: 'Thân', hour: 15 }, { chi: 'Dậu', hour: 17 }, { chi: 'Tuất', hour: 19 }, { chi: 'Hợi', hour: 21 } ];

                for (const h of hours) {
                    const hourCanChiText = getHourCanChi(dayCan, h.hour);
                    const hourCan = hourCanChiText.split(' ')[0], hourChi = hourCanChiText.split(' ')[1];

                    if (filterState.can.length > 0 && !filterState.can.includes(dayCan) && !filterState.can.includes(hourCan)) continue;
                    if (filterState.chi.length > 0 && !filterState.chi.includes(dayChi) && !filterState.chi.includes(hourChi)) continue;

                    let passLayer2 = true;
                    for (const [pKey, requiredHanh] of Object.entries(filterState.hanhPillar)) {
                        if (requiredHanh.length === 0) continue;
                        if (!getHanhVanForPillar(pKey, 'hanh', d, dateInfo, hourCanChiText).some(hv => requiredHanh.includes(hv))) { passLayer2 = false; break; }
                    }
                    if (!passLayer2) continue;

                    for (const [pKey, requiredVan] of Object.entries(filterState.vanPillar)) {
                        if (requiredVan.length === 0) continue;
                        if (!getHanhVanForPillar(pKey, 'van', d, dateInfo, hourCanChiText).some(vv => requiredVan.includes(vv))) { passLayer2 = false; break; }
                    }
                    if (!passLayer2) continue;

                    for (const [pairKey, requiredRels] of Object.entries(filterState.hanhPairs)) {
                        if (requiredRels.length === 0) continue;
                        const [p1, p2] = pairKey.split('-');
                        const hanh1 = getHanhVanForPillar(p1, 'hanh', d, dateInfo, hourCanChiText), hanh2 = getHanhVanForPillar(p2, 'hanh', d, dateInfo, hourCanChiText);
                        let pairMatched = false;
                        for (const h1 of hanh1) {
                            for (const h2 of hanh2) {
                                if ([...checkHanhRelations(h1, h2), ...checkDirectedRelations(h1, h2)].some(r => requiredRels.includes(r))) { pairMatched = true; break; }
                            }
                            if (pairMatched) break;
                        }
                        if (!pairMatched) { passLayer2 = false; break; }
                    }
                    if (!passLayer2) continue;

                    for (const [pairKey, requiredRels] of Object.entries(filterState.vanPairs)) {
                        if (requiredRels.length === 0) continue;
                        const [p1, p2] = pairKey.split('-');
                        const van1 = getHanhVanForPillar(p1, 'van', d, dateInfo, hourCanChiText), van2 = getHanhVanForPillar(p2, 'van', d, dateInfo, hourCanChiText);
                        let pairMatched = false;
                        for (const v1 of van1) {
                            for (const v2 of van2) {
                                if (checkVanRelations(v1, v2).some(r => requiredRels.includes(r))) { pairMatched = true; break; }
                            }
                            if (pairMatched) break;
                        }
                        if (!pairMatched) { passLayer2 = false; break; }
                    }
                    if (!passLayer2) continue;

                    for (const [pairKey, requiredRels] of Object.entries(filterState.chiPairs)) {
                        if (requiredRels.length === 0) continue;
                        const chi1 = getChiForPillar(pairKey.split('-')[0], d, dateInfo, hourCanChiText), chi2 = getChiForPillar(pairKey.split('-')[1], d, dateInfo, hourCanChiText);
                        if (!chi1 || !chi2) { passLayer2 = false; break; }
                        let pairMatched = false;
                        for (const rel of requiredRels) {
                            if (rel === 'Không Xung' && LUC_XUNG_MAP[chi1] !== chi2) pairMatched = true;
                            else if (rel === 'Tam Hợp' && isTamHop(chi1, chi2)) pairMatched = true;
                            else if (rel === 'Lục Hợp' && isLucHop(chi1, chi2)) pairMatched = true;
                        }
                        if (!pairMatched) { passLayer2 = false; break; }
                    }
                    if (!passLayer2) continue;

                    const hanhNgayArr = getHanhFromCanChi(dateInfo.dayCanChi), vanNgayArr = getVanFromCanChi(dateInfo.dayCanChi);
                    const hanhGioArr = getHanhFromCanChi(hourCanChiText), vanGioArr = getVanFromCanChi(hourCanChiText);
                    let totalScore = 0, bestHanhRel = '', bestVanRel = '';
                    if (hanhGioArr.length > 0 && hanhNgayArr.length > 0) {
                        const rels = [...checkHanhRelations(hanhGioArr[0], hanhNgayArr[0]), ...checkDirectedRelations(hanhGioArr[0], hanhNgayArr[0])];
                        totalScore += getBestScore(rels); bestHanhRel = getBestRelName(rels);
                    }
                    if (vanGioArr.length > 0 && vanNgayArr.length > 0) {
                        const rels = checkVanRelations(vanGioArr[0], vanNgayArr[0]);
                        totalScore += getBestScore(rels); bestVanRel = getBestRelName(rels);
                    }

                    if (needHkdqCheck) {
                        const tatCaQueTheoTruLocal = { 'Trụ Tuổi': layDanhSachQueMobile(birthInfo.canChi), 'Trụ Tọa': layDanhSachQueMobile(toaInfo.canChi), 'Trụ Ngày': layDanhSachQueMobile(dateInfo.dayCanChi), 'Trụ Tháng': layDanhSachQueMobile(thangCanChiTK), 'Trụ Năm': layDanhSachQueMobile(namCanChiTK), 'Trụ Giờ': layDanhSachQueMobile(hourCanChiText) };
                        const chonTheoTruLocal = {};
                        Object.entries({ 'Trụ Tuổi': birthInfo.canChi, 'Trụ Tọa': toaInfo.canChi, 'Trụ Ngày': dateInfo.dayCanChi, 'Trụ Tháng': thangCanChiTK, 'Trụ Năm': namCanChiTK, 'Trụ Giờ': hourCanChiText }).forEach(([tenTru, cc]) => { chonTheoTruLocal[tenTru] = chonQuePhanTichMobile(cc, thuThapHoBangChungMobile(tenTru, tatCaQueTheoTruLocal)); });
                        try {
                            if (typeof phanTichNhatKhoaDayDu === 'function' && !checkHkdqConditions(phanTichNhatKhoaDayDu({ truTuoi: chonTheoTruLocal['Trụ Tuổi']?.queChon || '', truToa: chonTheoTruLocal['Trụ Tọa']?.queChon || '', truNgay: chonTheoTruLocal['Trụ Ngày']?.queChon || '', truThang: chonTheoTruLocal['Trụ Tháng']?.queChon || '', truNam: chonTheoTruLocal['Trụ Năm']?.queChon || '', truGio: chonTheoTruLocal['Trụ Giờ']?.queChon || '', lucXungList: [], tatCaQueTheoTru: tatCaQueTheoTruLocal }), filterState)) continue;
                        } catch (e) {}
                    }

                    // [MỚI] Điểm tổng 6 trụ (Tuổi-Tọa-Ngày-Tháng-Năm-Giờ) = điểm 5 trụ + tương tác của Giờ với từng trụ còn lại.
                    let scoreGioWithOthers = 0;
                    pillar5Base.forEach(p => { scoreGioWithOthers += computePairScoreHV(hanhGioArr, vanGioArr, p.hanh, p.van); });
                    const pillarScore6 = dateInfo.pillarScore5 + scoreGioWithOthers;
                    // [MỚI] Khung giờ chính xác của Giờ này, dịch theo giờ Chính Ngọ thực tế trong ngày.
                    const hourRange = getHourRangeLabel(h.hour, dateInfo.chinhNgo);
                    // [MỚI] Giải Trụ Giờ theo Hệ thống A (dùng 5 trụ nền đã giải làm bằng chứng huyết thống).
                    const gioResolved = resolveTruGio(hourCanChiText, truNen);
                    const canhBaoGio = computeCanhBaoGio(gioResolved.que, hourChi, truNen);
                    // [MỚI] Thiên Ất Quý Nhân của khung Giờ này (tra theo Can Ngày + Tiết Khí).
                    const thienAt = getThienAtQuyNhan(dayCan, dateInfo.tietKhi, hourChi);

                    passingHours.push({ chi: h.chi, hour: h.hour, hourCanChi: hourCanChiText, hanhGioArr, vanGioArr, totalScore, bestHanhRel, bestVanRel, pillarScore6, hourRange, ketQuaGio: gioResolved.ketQua, canhBaoGio, thienAt });
                }

                passingHours.sort((a, b) => b.totalScore - a.totalScore);
                if (passingHours.length > 0) {
                    filtered.push({ ...dateInfo, dayScore: Math.max(...passingHours.map(h => h.totalScore)), passingHours });
                }
            }

            MOBILE_STATE.filteredDates = filtered;
            MOBILE_STATE.displayCount = 15;

            window.renderResults();
            window.updateFilterBadge();
            updateResultsStats(filtered);
            overlay.style.display = 'none';

            const totalHours = filtered.reduce((sum, d) => sum + d.passingHours.length, 0);
            window.showToast(`✅ Đã lọc: ${filtered.length} ngày, ${totalHours} giờ`);

        } catch (err) {
            console.error(err); overlay.style.display = 'none'; window.showToast('❌ Lỗi khi lọc: ' + err.message);
        }
    });
};

function updateResultsStats(filtered) {
    document.getElementById('results-bar').style.display = 'flex';
    document.getElementById('stat-ngay').textContent = `${filtered.length} ngày`;
    document.getElementById('stat-gio').textContent = `${filtered.reduce((sum, d) => sum + d.passingHours.length, 0)} giờ`;
    document.getElementById('result-count-badge').textContent = filtered.length;
    document.getElementById('result-count-badge').style.display = 'inline-flex';
}

// ==================== BẢNG KẾT QUẢ ĐÃ CHỈNH SỬA ====================
window.renderResults = function renderResults() {
    const container = document.getElementById('results-container');
    const filtered = MOBILE_STATE.filteredDates;
    const displayCount = MOBILE_STATE.displayCount;
    const toShow = filtered.slice(0, displayCount);

    if (filtered.length === 0) {
        container.innerHTML = '<div class="m-empty-state"><span style="font-size:48px;">🔍</span><p>Không tìm thấy ngày nào phù hợp với bộ lọc</p></div>';
        document.getElementById('btn-load-more').style.display = 'none';
        return;
    }

    let html = '';
    toShow.forEach((dayInfo, idx) => { html += window.renderDayCard(dayInfo, idx); });
    container.innerHTML = html;

    document.getElementById('btn-load-more').style.display = displayCount < filtered.length ? 'flex' : 'none';
    window.updateSelectedCount();
};

function renderSinglePillarCell(canChi, ketQuaTru, canhBao) {
    const hanhArr = getHanhFromCanChi(canChi);
    const vanArr = getVanFromCanChi(canChi);
    const ques = layDanhSachQueMobile(canChi);

    let guaHtml = renderGuaVisual(canChi, hanhArr, vanArr);

    let relationsHtml = '';
    if (ques.length === 0) {
        relationsHtml = '<div class="m-hkdq-relations">-<br>-</div>';
    } else if (!ketQuaTru || !ketQuaTru.thongTinDuocChon) {
        // [SỬA] Không còn lấy đại dòng đầu tiên (ttList[0]) — đúng theo Hệ thống A, nếu không có
        // căn cứ huyết thống rõ ràng (0 hoặc ≥2 họ khớp) thì hiển thị KXĐ kèm lý do, không đoán bừa.
        const lyDo = ketQuaTru && ketQuaTru.lyDoKXDLabel;
        relationsHtml = `<div class="m-hkdq-relations">- <span class="tc-kxd">KXĐ${lyDo ? ` (${lyDo})` : ''}</span><br>-</div>`;
    } else {
        const tt = ketQuaTru.thongTinDuocChon;
        relationsHtml = `<div class="m-hkdq-relations">- ${tt.vaiTroChiTiet || '-'}<br>- ${tt.giaDinh || '-'}</div>`;
    }
    if (canhBao) relationsHtml += renderCanhBaoNoteHtml(canhBao.tt, canhBao.xung);

    return { canChi, guaHtml, relationsHtml };
}

window.renderDayCard = function renderDayCard(dayInfo, idx) {
    const jdn = dayInfo.jdn;
    const isSelected = MOBILE_STATE.selectedDays[jdn];
    const solarDate = `${String(dayInfo.solarDay).padStart(2, '0')}/${String(dayInfo.solarMonth).padStart(2, '0')}/${dayInfo.solarYear}`;
    const lunarDate = `${dayInfo.lunarDay}/${dayInfo.lunarMonth}${dayInfo.lunarLeap ? ' (N)' : ''}/${dayInfo.lunarYear}`;
    const dayOfWeek = NGAY_TRONG_TUAN[(jdn + 1) % 7];
    const d = MOBILE_STATE.inputData;
    
    const truNen = dayInfo._truNen, canhBaoTruNen = dayInfo._canhBaoTruNen;
    const cols = [];
    cols.push({ title: 'TUỔI', ...renderSinglePillarCell(d.birthInfo.canChi, truNen && truNen.ketQua['Trụ Tuổi'], canhBaoTruNen && { tt: canhBaoTruNen.tt['Trụ Tuổi'].map(t => TEN_TRU_NGAN[t]), xung: canhBaoTruNen.xung['Trụ Tuổi'].map(t => TEN_TRU_NGAN[t]) }) });
    cols.push({ title: 'TỌA', ...renderSinglePillarCell(d.toaInfo.canChi, truNen && truNen.ketQua['Trụ Tọa'], canhBaoTruNen && { tt: canhBaoTruNen.tt['Trụ Tọa'].map(t => TEN_TRU_NGAN[t]), xung: canhBaoTruNen.xung['Trụ Tọa'].map(t => TEN_TRU_NGAN[t]) }) });
    cols.push({ title: 'NGÀY', ...renderSinglePillarCell(dayInfo.dayCanChi, truNen && truNen.ketQua['Trụ Ngày'], canhBaoTruNen && { tt: canhBaoTruNen.tt['Trụ Ngày'].map(t => TEN_TRU_NGAN[t]), xung: canhBaoTruNen.xung['Trụ Ngày'].map(t => TEN_TRU_NGAN[t]) }) });
    cols.push({ title: 'THÁNG', ...renderSinglePillarCell(dayInfo.thangCanChiTK, truNen && truNen.ketQua['Trụ Tháng'], canhBaoTruNen && { tt: canhBaoTruNen.tt['Trụ Tháng'].map(t => TEN_TRU_NGAN[t]), xung: canhBaoTruNen.xung['Trụ Tháng'].map(t => TEN_TRU_NGAN[t]) }) });
    cols.push({ title: 'NĂM', ...renderSinglePillarCell(dayInfo.namCanChiTK, truNen && truNen.ketQua['Trụ Năm'], canhBaoTruNen && { tt: canhBaoTruNen.tt['Trụ Năm'].map(t => TEN_TRU_NGAN[t]), xung: canhBaoTruNen.xung['Trụ Năm'].map(t => TEN_TRU_NGAN[t]) }) });

    dayInfo.passingHours.forEach((h, index) => {
        const hourKey = `${jdn}_${h.chi}`;
        const isHourSelected = MOBILE_STATE.selectedHours[hourKey];
        const qnHtml = h.thienAt ? `<span class="m-hour-qn" title="Thiên Ất Quý Nhân (${h.thienAt})">★QN</span>` : '';
        const titleHtml = `<div class="m-hour-title" onclick="window.toggleHourSelect(event, '${hourKey}', '${h.chi}', this)">
                <span class="m-hour-name">GIỜ ${h.chi.toUpperCase()} ${qnHtml}</span>
                <span class="m-hour-range">${h.hourRange || ''}</span>
                <span class="m-hour-score">Đ: ${h.pillarScore6}</span>
                <span class="m-hour-check" id="chk-hr-${hourKey}">${isHourSelected ? '✅' : '☐'}</span>
            </div>`;
        cols.push({ title: titleHtml, ...renderSinglePillarCell(h.hourCanChi, h.ketQuaGio, h.canhBaoGio) });
    });

    return `
        <div class="m-day-card ${isSelected ? 'selected' : ''}" id="day-card-${jdn}">
            <div class="m-day-header" onclick="window.toggleDayExpand(${jdn})">
                <div class="m-day-header-top">
                    <div class="m-day-select" onclick="window.toggleDaySelect(event, ${jdn}, this)">
                        <div class="m-checkbox ${isSelected ? 'checked' : ''}"></div>
                    </div>
                    <div class="m-day-title">
                        <span class="m-solar-date">${solarDate}</span>
                        <span class="m-day-dow">(${dayOfWeek})</span>
                    </div>
                    <div class="m-lunar-badge">Âm Lịch: ${lunarDate}</div>
                </div>
                <div class="m-day-header-bot">
                    <span><strong>Ngày:</strong> ${dayInfo.dayCanChi} (Tháng ${dayInfo.monthCanChi})</span>
                    <span><strong>Tiết:</strong> ${dayInfo.tietKhi} (Tháng TK: ${dayInfo.tietKhiMonth || 'N/A'})</span>
                    <span><strong>Chính Ngọ:</strong> ${dayInfo.chinhNgo || 'N/A'}</span>
                    <span class="m-day-score"><strong>Điểm 5 Trụ:</strong> ${dayInfo.pillarScore5 ?? 0}</span>
                </div>
            </div>
            
            <div class="m-day-body" id="day-body-${jdn}">
                <div class="m-hkdq-table-wrap">
                    <table class="m-hkdq-table">
                        <thead>
                            <tr>${cols.map(c => `<th>${c.title}</th>`).join('')}</tr>
                            <tr class="row-canchi">${cols.map(c => `<td>${c.canChi}</td>`).join('')}</tr>
                        </thead>
                        <tbody>
                            <tr class="row-gua">${cols.map(c => `<td>${c.guaHtml}</td>`).join('')}</tr>
                            <tr class="row-relations">${cols.map(c => `<td>${c.relationsHtml}</td>`).join('')}</tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;
};

window.toggleDayExpand = function toggleDayExpand(jdn) {
    const body = document.getElementById('day-body-' + jdn);
    if (!body) return;
    body.classList.toggle('open');
};

window.toggleDaySelect = function toggleDaySelect(event, jdn, el) {
    if(event) event.stopPropagation();
    if (MOBILE_STATE.selectedDays[jdn]) {
        delete MOBILE_STATE.selectedDays[jdn];
        Object.keys(MOBILE_STATE.selectedHours).forEach(k => {
            if (k.startsWith(jdn + '_')) delete MOBILE_STATE.selectedHours[k];
        });
    } else {
        MOBILE_STATE.selectedDays[jdn] = true;
        const dayInfo = MOBILE_STATE.filteredDates.find(d => d.jdn === jdn);
        if (dayInfo) {
            dayInfo.passingHours.forEach(h => {
                MOBILE_STATE.selectedHours[jdn + '_' + h.chi] = true;
            });
        }
    }
    window.updateDayCardUI(jdn);
    window.updateSelectedCount();
};

window.toggleHourSelect = function toggleHourSelect(event, hourKey, chi, el) {
    if(event) event.stopPropagation();
    const isSelected = MOBILE_STATE.selectedHours[hourKey];
    if (isSelected) {
        delete MOBILE_STATE.selectedHours[hourKey];
    } else {
        MOBILE_STATE.selectedHours[hourKey] = true;
    }
    const chk = document.getElementById(`chk-hr-${hourKey}`);
    if(chk) chk.textContent = MOBILE_STATE.selectedHours[hourKey] ? '✅' : '☐';
    window.updateSelectedCount();
};

window.updateDayCardUI = function updateDayCardUI(jdn) {
    const idx = MOBILE_STATE.filteredDates.findIndex(d => d.jdn === jdn);
    if (idx >= 0 && idx < MOBILE_STATE.displayCount) {
        const dayInfo = MOBILE_STATE.filteredDates[idx];
        const cardEl = document.getElementById('day-card-' + jdn);
        if (cardEl && dayInfo) {
            const isOpen = cardEl.querySelector('.m-day-body').classList.contains('open');
            cardEl.outerHTML = window.renderDayCard(dayInfo, idx);
            if(isOpen) {
                document.getElementById('day-body-' + jdn).classList.add('open');
            }
        }
    }
};

window.updateSelectedCount = function updateSelectedCount() {
    // [SỬA] Trước đây đếm số GIỜ đã chọn — nay chỉ đếm số NGÀY đã chọn theo yêu cầu.
    const totalSelectedDays = Object.keys(MOBILE_STATE.selectedDays).length;
    const el = document.getElementById('selected-count');
    if (el) el.textContent = totalSelectedDays;
};

window.loadMoreResults = function loadMoreResults() {
    MOBILE_STATE.displayCount += 15;
    window.renderResults();
};

// ==================== DETAIL MODAL ====================
window.showDetailModal = function showDetailModal(jdn, chi) {
    const dayInfo = MOBILE_STATE.filteredDates.find(d => d.jdn === jdn);
    if (!dayInfo) return;
    const hourData = dayInfo.passingHours.find(h => h.chi === chi);
    if (!hourData) return;
    const content = document.getElementById('detail-modal-content');
    content.innerHTML = `<div class="m-detail-block"><div class="m-detail-block-title">⏰ CHI TIẾT GIỜ</div><p>Bạn đã chọn Giờ ${chi}. Bảng ngang đã hiển thị đầy đủ Quẻ HKĐQ.</p></div>`;
    document.getElementById('detail-modal-title').textContent = `Giờ ${chi} - ${dayInfo.dayCanChi}`;
    document.getElementById('detail-modal').style.display = 'flex';
};
window.closeDetailModal = function closeDetailModal() { document.getElementById('detail-modal').style.display = 'none'; };

// ==================== SELECTED LIST ====================
window.showSelectedList = function showSelectedList() {
    const sheet = document.getElementById('selected-sheet'), content = document.getElementById('selected-list-content');
    const selectedDays = Object.keys(MOBILE_STATE.selectedDays).map(Number), selectedHours = Object.keys(MOBILE_STATE.selectedHours);
    if (selectedHours.length === 0) { content.innerHTML = '<p class="m-empty-text">Chưa có ngày/giờ nào được chọn</p>'; } 
    else {
        let html = '';
        selectedDays.forEach(jdn => {
            const dayInfo = MOBILE_STATE.filteredDates.find(d => d.jdn === jdn) || MOBILE_STATE.allDates.find(d => d.jdn === jdn);
            if (!dayInfo) return;
            const solarDate = `${String(dayInfo.solarDay).padStart(2, '0')}/${String(dayInfo.solarMonth).padStart(2, '0')}/${dayInfo.solarYear}`;
            const hoursForDay = selectedHours.filter(k => k.startsWith(jdn + '_')).map(k => k.split('_')[1]);
            html += `<div class="m-selected-item"><div class="m-selected-item-info"><b>${solarDate}</b> – ${dayInfo.dayCanChi}<br><small class="text-gold">Giờ: ${hoursForDay.join(', ') || 'Tất cả'}</small></div><span class="m-selected-item-remove" onclick="window.deselectDay(${jdn})">🗑️</span></div>`;
        });
        content.innerHTML = html;
    }
    sheet.style.display = 'flex';
};

window.hideSelectedList = function hideSelectedList() { document.getElementById('selected-sheet').style.display = 'none'; };
window.deselectDay = function deselectDay(jdn) {
    delete MOBILE_STATE.selectedDays[jdn];
    Object.keys(MOBILE_STATE.selectedHours).forEach(k => { if (k.startsWith(jdn + '_')) delete MOBILE_STATE.selectedHours[k]; });
    window.updateSelectedCount(); window.showSelectedList(); window.updateDayCardUI(jdn);
};

// ==================== CLEAR ALL FILTERS ====================
window.clearAllFilters = function clearAllFilters() {
    document.querySelectorAll('.m-filter-item input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('.m-chip.active').forEach(chip => chip.classList.remove('active'));
    document.querySelectorAll('.m-pair-chip.active').forEach(chip => chip.classList.remove('active'));

    MOBILE_STATE.selectedMonths = Array.from({ length: 12 }, (_, i) => i + 1);
    buildMonthGrid();
    document.querySelectorAll('.m-select-all-btn').forEach(btn => btn.textContent = '✅ Chọn tất cả');

    MOBILE_STATE.filteredDates = [];
    MOBILE_STATE.displayCount = 15;
    MOBILE_STATE.filterState = null;
    
    document.getElementById('results-container').innerHTML = '<div class="m-empty-state"><span style="font-size:48px;">🔍</span><p>Hãy qua màn hình Bộ Lọc và nhấn "ÁP DỤNG" để chọn ngày.</p></div>';
    document.getElementById('results-bar').style.display = 'none';
    document.getElementById('btn-load-more').style.display = 'none';
    document.getElementById('result-count-badge').style.display = 'none';
    window.updateFilterBadge();
    window.showToast('🗑️ Đã xóa tất cả bộ lọc');
};

// ==================== PRINT ====================
window.printSelected = function printSelected() {
    const selectedDays = Object.keys(MOBILE_STATE.selectedDays).map(Number), selectedHours = Object.keys(MOBILE_STATE.selectedHours);
    if (selectedHours.length === 0) { window.showToast('⚠️ Chưa chọn ngày/giờ nào để in'); return; }

    // [SỬA] #print-selected-content trước đây không tồn tại trong trang → dòng dưới ném lỗi và
    // window.print() không bao giờ chạy tới (nút "In" coi như không hoạt động). Đã bổ sung div
    // này trong index.html. Nội dung in gồm: (1) ghi chú cho khách [GHICHUCHOKHACH.js], (2) danh
    // sách ngày giờ đã chọn [khối này], (3) ấn triện + chữ ký [tĩnh, đã có sẵn trong index.html].
    const printContent = document.getElementById('print-selected-content');
    if (!printContent) { window.showToast('⚠️ Thiếu khối in — vui lòng tải lại trang'); return; }

    let html = '<h3>Danh Sách Ngày Giờ Đã Chọn</h3>';
    selectedDays.forEach(jdn => {
        const dayInfo = MOBILE_STATE.filteredDates.find(d => d.jdn === jdn) || MOBILE_STATE.allDates.find(d => d.jdn === jdn);
        if (!dayInfo) return;
        const solarDate = `${String(dayInfo.solarDay).padStart(2, '0')}/${String(dayInfo.solarMonth).padStart(2, '0')}/${dayInfo.solarYear}`;
        const hoursForDay = selectedHours.filter(k => k.startsWith(jdn + '_')).map(k => k.split('_')[1]);

        html += `<div class="m-print-day"><strong>${solarDate}</strong> – ${dayInfo.dayCanChi} – ÂL: ${dayInfo.lunarDay}/${dayInfo.lunarMonth}/${dayInfo.lunarYear}<br>Tiết khí: ${dayInfo.tietKhi || '-'}<br><em>Giờ tốt: ${hoursForDay.join(', ')}</em></div>`;
    });
    printContent.innerHTML = html;
    window.print();
};

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    const nowYear = new Date().getFullYear();
    const viewYearInput = document.getElementById('m-view-year');
    if (viewYearInput && !viewYearInput.value) viewYearInput.value = nowYear;

    createFilterUI();
    ['m-birth-year', 'm-toa-do', 'm-view-year', 'm-event', 'm-location'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('keyup', (e) => { if (e.key === 'Enter') window.handleViewResult(); });
    });
    document.querySelector('.m-modal-overlay')?.addEventListener('click', window.closeDetailModal);
    document.querySelector('.m-sheet-overlay')?.addEventListener('click', window.hideSelectedList);
    window.updateFilterBadge();
});
