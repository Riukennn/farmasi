import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  arrayUnion,
  deleteDoc,
  onSnapshot,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA5rG1OWZ0n2lhoWnL86HbKmhlqmupg9X0",
  authDomain: "bram-94f17.firebaseapp.com",
  projectId: "bram-94f17",
  storageBucket: "bram-94f17.firebasestorage.app",
  messagingSenderId: "928090859542",
  appId: "1:928090859542:web:d13c15789e695f70e56d37",
  measurementId: "G-TP1E1Q1N09"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


onSnapshot(collection(db, "bidang"), (snapshot) => {
    data = {};

    snapshot.forEach((d) => {
        data[d.data().nama] = {
            id: d.id,
            dokter: d.data().dokter || []
        };
    });

    renderBidang();

    // 🔥 ambil dari localStorage
    const savedBidang = localStorage.getItem("bidangAktif");
    const savedDokter = localStorage.getItem("dokterAktif");

    if (savedBidang && data[savedBidang]) {
        bidangAktif = savedBidang;
        renderDokter();

        if (savedDokter && data[savedBidang].dokter.includes(savedDokter)) {
            dokterAktif = savedDokter;
            document.getElementById("selectedDoctor").innerText = savedDokter;
            loadDataDokter();
        }
    }
});

async function tambahBidangFirestore(nama) {
  await addDoc(collection(db, "bidang"), {
    nama: nama,
    dokter: []
  });
  alert("Berhasil tambah!");
}

// DATA AWAL (bisa kosong juga)
let data = {
};

let bidangAktif = null;
let deleteTarget = null;
let deleteType = null;
let dokterAktif = null;
let dokterAktifId = null;


function renderBidang() {
    const bidangList = document.getElementById("bidangList");

    // simpan form dulu
    const form = document.createElement("li");
    form.className = "add-bidang-form";
    form.innerHTML = `
        <input type="text" id="newBidang" placeholder="Tambah bidang...">
        <button onclick="tambahBidang()">+</button>
    `;

    bidangList.innerHTML = "";

    Object.keys(data).forEach(bidang => {
        const li = document.createElement("li");
        li.className = "list-item";

        li.onclick = () => pilihBidang(bidang);

        li.innerHTML = `
            <div class="text-wrapper">
                <span class="scroll-text">${bidang}</span>
            </div>
            <div class="item-actions">
                <button class="btn-edit">Edit</button>
                <button class="btn-remove">X</button>
            </div>
        `;

        li.querySelector(".btn-edit").onclick = (e) => {
            e.stopPropagation();
            editBidang(bidang);
        };

        li.querySelector(".btn-remove").onclick = (e) => {
            e.stopPropagation();
            showDelete('bidang', bidang);
        };

        bidangList.appendChild(li);
    });

    bidangList.appendChild(form);
}

// tutup dropdown kalau klik luar
document.addEventListener("click", function(e) {
    const dropdown = document.getElementById("bidangList");
    const wrapper = document.querySelector(".dropdown-wrapper");

    if (!wrapper.contains(e.target)) {
        dropdown.style.display = "none";
    }
});


// TOGGLE DROPDOWN
function toggleBidang() {
    const list = document.getElementById("bidangList");
    list.style.display = list.style.display === "block" ? "none" : "block";
}


function pilihBidang(bidang) {
    bidangAktif = bidang;

    // simpan ke localStorage
    localStorage.setItem("bidangAktif", bidang);

    renderDokter();
    document.getElementById("bidangList").style.display = "none";
}


function renderDokter() {
    const doctorList = document.getElementById("doctorList");
    doctorList.innerHTML = "";

    if (!bidangAktif) {
        doctorList.innerHTML = "<li>Pilih bidang dahulu</li>";
        return;
    }

    data[bidangAktif].dokter.forEach((nama, index) => {
        const li = document.createElement("li");
        li.className = "list-item";

        li.innerHTML = `
            <div class="text-wrapper">
                <span class="scroll-text">${nama}</span>
            </div>
            <div class="item-actions">
                <button class="btn-edit">Edit</button>
                <button class="btn-remove">X</button>
            </div>
        `;

        // klik baris = pilih dokter
        li.onclick = () => pilihDokter(nama);

        li.querySelector(".btn-edit").onclick = (e) => {
            e.stopPropagation();
            editDokter(index);
        };

        li.querySelector(".btn-remove").onclick = (e) => {
            e.stopPropagation();
            showDelete('dokter', index);
        };

        doctorList.appendChild(li);
    });
}

function pilihDokter(nama) {
    dokterAktif = nama;

    // simpan ke localStorage
    localStorage.setItem("dokterAktif", nama);

    document.getElementById("selectedDoctor").innerText = nama;

    loadDataDokter();
}


async function tambahBidang() {
    const input = document.getElementById("newBidang");
    const nama = input.value.trim();

    if (!nama) return alert("Isi nama bidang!");

    await tambahBidangFirestore(nama);

    input.value = "";
}


async function tambahDokter() {
    if (!bidangAktif) return alert("Pilih bidang dulu!");

    const input = document.getElementById("newDoctor");
    const nama = input.value.trim();

    if (!nama) return alert("Isi nama dokter!");

    const bidangId = data[bidangAktif].id;

    const ref = doc(db, "bidang", bidangId);

    await updateDoc(ref, {
        dokter: arrayUnion(nama)
    });

    input.value = "";
}


// INIT
renderBidang();

async function editBidang(nama) {
    const baru = prompt("Edit nama bidang:", nama);
    if (!baru) return;

    const bidangId = data[nama].id;
    const ref = doc(db, "bidang", bidangId);

    await updateDoc(ref, {
        nama: baru
    });
}

async function editDokter(index) {
    const lama = data[bidangAktif].dokter[index];
    const baru = prompt("Edit nama dokter:", lama);
    if (!baru) return;

    const bidangId = data[bidangAktif].id;
    const ref = doc(db, "bidang", bidangId);

    const dokterBaru = [...data[bidangAktif].dokter];
    dokterBaru[index] = baru;

    await updateDoc(ref, {
        dokter: dokterBaru
    });
}

function showDelete(type, target) {
    deleteType = type;
    deleteTarget = target;

    document.getElementById("confirmText").innerText =
        "Yakin anda ingin menghapus ini?";

    document.getElementById("confirmModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("confirmModal").style.display = "none";
}

async function confirmDelete() {
    if (deleteType === "bidang") {
        const bidangId = data[deleteTarget].id;
        await deleteDoc(doc(db, "bidang", bidangId));
        bidangAktif = null;
    }

    if (deleteType === "dokter") {
        const bidangId = data[bidangAktif].id;
        const ref = doc(db, "bidang", bidangId);

        const dokterBaru = data[bidangAktif].dokter.filter(
            (d, i) => i !== deleteTarget
        );

        await updateDoc(ref, {
            dokter: dokterBaru
        });
    }

    closeModal();
}

async function tambahPeserta(dataPeserta) {
    if (!dokterAktifId) return alert("Pilih dokter dulu!");

    await addDoc(
        collection(db, "bidang", data[bidangAktif].id, "dokter", dokterAktif, "peserta"),
        dataPeserta
    );
}

document.getElementById("uploadExcel").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async (evt) => {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        for (let row of json) {
            await addDoc(collection(db, "peserta"), {
                bidang: bidangAktif,
                dokter: dokterAktif,
                statusPakan: row.Status,
                jamPakan: row.Jam,
                sisaPakan: row.Sisa,
                persen: row.Persen,
                gram: row.Gram
            });
                    }

        alert("Import berhasil!");
    };

    reader.readAsArrayBuffer(file);
});

document.querySelector(".btn-add").addEventListener("click", () => {

    if (!dokterAktif) {
        alert("Pilih dokter dulu!");
        return;
    }

    document.getElementById("uploadExcel").click();
});

let unsubscribePeserta = null;

function loadDataDokter() {

    if (!bidangAktif || !dokterAktif) return;

    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";

    // hentikan listener lama kalau ada
    if (unsubscribePeserta) {
        unsubscribePeserta();
    }

    const q = query(
        collection(db, "peserta"),
        where("bidang", "==", bidangAktif),
        where("dokter", "==", dokterAktif)
    );

    unsubscribePeserta = onSnapshot(q, (snapshot) => {

        tableBody.innerHTML = "";

        if (snapshot.empty) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">Belum ada data</td>
                </tr>
            `;
            return;
        }

        snapshot.forEach((doc) => {
            const d = doc.data();

            tableBody.innerHTML += `
                <tr>
                    <td>${d.statusPakan || "-"}</td>
                    <td>${d.jamPakan || "-"}</td>
                    <td>${d.sisaPakan || "-"}</td>
                    <td>${d.persen || "-"}</td>
                    <td>${d.gram || "-"}</td>
                </tr>
            `;
        });
    });
}


window.toggleBidang = toggleBidang;
window.tambahBidang = tambahBidang;
window.tambahDokter = tambahDokter;
window.closeModal = closeModal;
window.confirmDelete = confirmDelete;
window.pilihDokter = pilihDokter;
