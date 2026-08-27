// ==========================================
// MAIN.JS - Khởi tạo & Sự kiện
// ==========================================
// Điều phối toàn bộ ứng dụng.
// File cuối cùng được load.

async function fullRebuild() {
    document.getElementById('loading-overlay').style.display = 'flex';
    await new Promise(resolve => setTimeout(resolve, 50));

    // Cập nhật các khối thông tin
    updateTuoiXemInfo();
    updateNamXemInfo();
    updateToaDoInfo();
    updateSummaryTable();
    updateTamHopBoLongTable();
    updateThaiDuongAmTable();

    // Tối ưu
    const birthYear = document.getElementById('birth-year').value;
    const toaDo = document.getElementById('toa-do').value;
    const viewYear = parseInt(document.getElementById('view-year').value);

    const tuoiCanChi = birthYear ? getYearCanChiInfo(parseInt(birthYear)).canChi : null;
    const toaInfo = toaDo ? findDataByDegree(toaDo) : null;

    const hanhTuoiArr = tuoiCanChi ? getHanhFromCanChi(tuoiCanChi) : [];
    const hanhToaArr = toaInfo ? getHanhFromCanChi(toaInfo.canChi) : [];
    const vanTuoiArr = tuoiCanChi ? getVanFromCanChi(tuoiCanChi) : [];
    const vanToaArr = toaInfo ? getVanFromCanChi(toaInfo.canChi) : [];
    const namCanChi = viewYear ? getYearCanChiInfo(viewYear).canChi : null;
    const hanhNamArr = namCanChi ? getHanhFromCanChi(namCanChi) : [];
    const vanNamArr = namCanChi ? getVanFromCanChi(namCanChi) : [];

    // Tối ưu Trụ Ngày
    const optimalHanhNgay = solveToiUu(hanhTuoiArr, hanhToaArr);
    const optimalVanNgay = solveToiUuVan(vanTuoiArr, vanToaArr);
    renderToiUuResults(optimalHanhNgay, 'toi-uu-results', 'Hành');
    renderToiUuResults(optimalVanNgay, 'toi-uu-van-results', 'Vận');

    // Tối ưu chuỗi Giờ-Tháng
    const hanhChains = solveChainedHanhOptimization(optimalHanhNgay, hanhNamArr);
    const vanChains = solveChainedVanOptimization(optimalVanNgay, vanNamArr);
    renderChains(hanhChains, 'toi-uu-hanh-gio-thang-results', 'Hành');
    renderChains(vanChains, 'toi-uu-van-gio-thang-results', 'Vận');

    // Tối ưu 6 trụ
    inject6PillarDivs();
    const fullResult = solveFull6PillarOptimization({
        hanhTuoiArr, hanhToaArr, hanhNamArr,
        vanTuoiArr, vanToaArr, vanNamArr,
        hasTuoi: hanhTuoiArr.length > 0,
        hasToa: hanhToaArr.length > 0,
        hasNam: hanhNamArr.length > 0
    });
    renderChains(fullResult.hanh, 'toi-uu-hanh-6-tru-results', 'Hành 6 Trụ');
    renderChains(fullResult.van, 'toi-uu-van-6-tru-results', 'Vận 6 Trụ');

    // Tạo bảng
    await generateYearTable();
    applyFilters();
    document.getElementById('loading-overlay').style.display = 'none';
}

function inject6PillarDivs() {
    if (!document.getElementById('toi-uu-hanh-6-tru-results')) {
        const container = document.getElementById('toi-uu-van-gio-thang-results').parentNode;
        container.insertAdjacentHTML('beforeend', '<b style="font-size:12px;color:#0056b3;margin-top:10px;display:block;">TỐI ƯU HÀNH (6 Trụ):</b><div id="toi-uu-hanh-6-tru-results" style="font-size:12px;padding-top:8px;min-height:40px;margin-bottom:10px;"></div>');
        container.insertAdjacentHTML('beforeend', '<b style="font-size:12px;color:#0056b3;margin-top:10px;display:block;">TỐI ƯU VẬN (6 Trụ):</b><div id="toi-uu-van-6-tru-results" style="font-size:12px;padding-top:8px;min-height:40px;margin-bottom:10px;"></div>');
    }
}

// ========== WINDOW ONLOAD ==========
window.onload = async () => {
    try {
        document.getElementById('view-year').value = new Date().getFullYear();
        await fullRebuild();
        setupColumnToggles();
        createFilterInputs();

        // Event listeners
        ['birth-year', 'toa-do', 'view-year'].forEach(id => {
            const el = document.getElementById(id);
            el.addEventListener('keyup', async (e) => { if (e.key === 'Enter') await fullRebuild(); });
            el.addEventListener('change', fullRebuild);
        });
        document.getElementById('location-check').addEventListener('keyup', async (e) => {
            if (e.key === 'Enter') { await generateYearTable(); applyFilters(); }
        });

        const tableBody = document.getElementById('table-body');
        tableBody.addEventListener('click', (e) => {
            const sttCell = e.target.closest('td[data-col-idx="0"]');
            if (sttCell) { sttCell.parentElement.classList.toggle('row-marked'); return; }
            const hourCell = e.target.closest('.hour-cell');
            if (hourCell) {
                const prevSelected = document.querySelector('.hour-cell.analysis-selected');
                if (prevSelected) prevSelected.classList.remove('analysis-selected');
                hourCell.classList.add('analysis-selected');
                populateAnalysisTable(hourCell);
            }
        });
        tableBody.addEventListener('dblclick', (e) => {
            const hourCell = e.target.closest('.hour-cell');
            if (hourCell) { e.preventDefault(); hourCell.classList.toggle('manual-highlight'); }
        });

        document.getElementById('btn-toggle-hidden-rows').addEventListener('click', (e) => {
            document.body.classList.toggle('hide-mode');
            e.target.textContent = document.body.classList.contains('hide-mode') ? 'Hiện Lại Dòng' : 'Ẩn Dòng';
            e.target.classList.toggle('active');
        });
        document.getElementById('btn-notes').addEventListener('click', () => {
            const notes = document.getElementById('notes-container');
            notes.style.display = notes.style.display === 'block' ? 'none' : 'block';
        });
        document.getElementById('btn-print-view').addEventListener('click', () => {
            document.body.classList.remove('print-mode-khach');
            window.print();
        });
        document.getElementById('btn-print-khach').addEventListener('click', () => {
            document.body.classList.add('print-mode-khach');
            const afterPrintHandler = () => { document.body.classList.remove('print-mode-khach'); window.removeEventListener('afterprint', afterPrintHandler); };
            window.addEventListener('afterprint', afterPrintHandler);
            window.print();
        });
    } catch (error) {
        console.error(error);
        document.getElementById('loading-overlay').innerHTML = '<span>Đã xảy ra lỗi! Vui lòng tải lại trang.</span>';
    }
};
