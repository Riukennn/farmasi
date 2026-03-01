import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  arrayUnion,
  deleteDoc 
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

import { onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

onSnapshot(collection(db, "bidang"), (snapshot) => {
    data = {};

    snapshot.forEach((d) => {
        data[d.data().nama] = {
            id: d.id,
            dokter: d.data().dokter || []
        };
    });

    renderBidang();

    // 🔥 Tambahkan ini
    if (bidangAktif && data[bidangAktif]) {
        renderDokter();
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
    const form = bidangList.querySelector(".add-bidang-form");
    bidangList.innerHTML = "";

    Object.keys(data).forEach(bidang => {
        const li = document.createElement("li");
        li.className = "list-item";

        // klik baris = pilih bidang
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

        // tombol edit
        li.querySelector(".btn-edit").onclick = (e) => {
            e.stopPropagation(); // penting!
            editBidang(bidang);
        };

        // tombol hapus
        li.querySelector(".btn-remove").onclick = (e) => {
            e.stopPropagation(); // penting!
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


// PILIH BIDANG
function pilihBidang(bidang) {
    bidangAktif = bidang;
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

    document.querySelector("h2").innerText = nama;

    // Kalau ada tabel data
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
        collection(db, "bidang", bidangAktifId, "dokter", dokterAktifId, "peserta"),
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
            await addDoc(
                collection(db, "bidang", bidangAktifId, "dokter", dokterAktifId, "peserta"),
                {
                    nama: row.Nama,
                    statusPakan: row.Status,
                    jamPakan: row.Jam,
                    sisaPakan: row.Sisa,
                    persen: row.Persen,
                    gram: row.Gram
                }
            );
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


window.toggleBidang = toggleBidang;
window.tambahBidang = tambahBidang;
window.tambahDokter = tambahDokter;
window.closeModal = closeModal;
window.confirmDelete = confirmDelete;
window.pilihDokter = pilihDokter;