import { Injectable } from '@nestjs/common';
import axios from 'axios';
require('dotenv').config();

@Injectable()
export class MedicalService {

  async populateMedicalRecords() {
    try {
      const { status, data } = await axios.post(`${process.env.BASE_URL}/populateMedicalRecords`);

      return { status, data }

    } catch (error) {
      return { error: error.message }
    }
  }

  async assignDoctorToMedicalRecord(physicianId: string, medicalRecordId: string, patientId: string) {
    try {
      const { status, data } = await axios.post(`${process.env.BASE_URL}/medicalRecords/assignDoctor`, { physicianId, id: medicalRecordId, patientId });

      return { status, data }

    } catch (error) {
      return { error: error.message }
    }
  }

  async assignPharmacistToMedicalRecord(pharmacistId: string, medicalRecordId: string, patientId: string) {
    try {
      const { status, data } = await axios.post(`${process.env.BASE_URL}/medicalRecords/assignPharmacist`, { pharmacistId, id: medicalRecordId, patientId });

      return { status, data }

    } catch (error) {
      return { error: error.message }
    }
  }

  async addConsultation(id: string, physicianId: string, consultation: string) {
    try {
      const { status, data } = await axios.post(`${process.env.BASE_URL}/addConsultation`, { id, physicianId, consultation });

      return { status, data }

    } catch (error) {
      return { error }
    }
  }

  async addMedicine(id: string, pharmacistId: string, medicines: string) {
    try {
      const { status, data } = await axios.post(`${process.env.BASE_URL}/addMedicine`, { id, medicines, pharmacistId });

      return { status, data }

    } catch (error) {
      return { error }
    }
  }

  async getMedicalRecordsByPatientId(patientId: string) {
    try {
      const { status, data } = await axios.get(`${process.env.BASE_URL}/medicalRecords?patientId=${patientId}`);

      return { status, data }

    } catch (error) {
      return { error: error.message }
    }
  }

  async getMedicalRecordsByPhysicianId(physicianId: string) {
    try {
      const { status, data } = await axios.get(`${process.env.BASE_URL}/medicalRecords?physicianId=${physicianId}`);

      return { status, data }

    } catch (error) {
      return { error: error.message }
    }
  }

  async getMedicalRecordsByPharmacistId(pharmacistId: string) {
    try {
      const { status, data } = await axios.get(`${process.env.BASE_URL}/medicalRecords?pharmacistId=${pharmacistId}`);

      return { status, data }

    } catch (error) {
      return { error: error.message }
    }
  }

  async getMedicalRecords() {
    try {
      const { status, data } = await axios.get(`${process.env.BASE_URL}/medicalRecords`);

      return { status, data }

    } catch (error) {
      return { error: error.message }
    }
  }

  async getAllPhysicians() {
    try {
      const { status, data } = await axios.get(`${process.env.BASE_URL}/physicians`);

      return { status, data }

    } catch (error) {
      return { error: error.message }
    }
  }

  async getAllPharmacists() {
    try {
      const { status, data } = await axios.get(`${process.env.BASE_URL}/pharmacists`);

      return { status, data }

    } catch (error) {
      return { error: error.message }
    }
  }
}
