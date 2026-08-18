import { UniversityVerification } from "@/types";

export const mockUniversityVerifications: UniversityVerification[] = [
  {
    id: "1",
    name: "La Consolacion College Bacolod",
    domain: "@lccb.edu.ph",
    status: "PENDING",
    detail: "Submitted Jul 4, 2026 · Proof: CHED_Recognition.pdf",
  },
  {
    id: "2",
    name: "University of Science and Technology of Southern Philippines",
    domain: "@ustp.edu.ph",
    status: "PENDING",
    detail: "Submitted Jul 6, 2026 · Proof: Institution_Charter.pdf",
  },
  {
    id: "3",
    name: "Silliman University",
    domain: "@su.edu.ph",
    status: "PENDING",
    detail: "Submitted Jul 7, 2026 · Proof: SEC_Registration.pdf",
  },
  {
    id: "4",
    name: "University of the Immaculate Conception",
    domain: "@uic.edu.ph",
    status: "VERIFIED",
    detail: "Approved Jun 24, 2026",
  },
  {
    id: "5",
    name: "De La Salle - College of Saint Benilde",
    domain: "@dlsu.edu.ph",
    status: "VERIFIED",
    detail: "Approved Jun 20, 2026",
  },
  {
    id: "6",
    name: "University of Makati",
    domain: "@umak.edu.ph",
    status: "VERIFIED",
    detail: "Approved Jun 15, 2026",
  },
];
