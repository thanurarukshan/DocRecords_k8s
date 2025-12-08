import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DoctorDashboard from "../pages/DoctorDashboard/DoctorDashboard";
import { MemoryRouter, useLocation } from "react-router-dom";

// Mock useLocation
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: jest.fn(),
}));

beforeEach(() => {
  global.fetch = jest.fn();
  jest.clearAllMocks();
});

const mockDoctor = {
  id: "doc123",
  fullName: "Dr. John Doe",
  age: 40,
  birthday: "1985-08-15",
  mobile: "1234567890",
  email: "doc@test.com",
  gender: "Male",
  mbbsReg: "MBBS123",
};

describe("DoctorDashboard", () => {
  beforeEach(() => {
    useLocation.mockReturnValue({ state: { user: mockDoctor } });
  });

  test("renders doctor profile correctly", () => {
    render(
      <MemoryRouter>
        <DoctorDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome, Dr. John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/User ID:/i)).toBeInTheDocument();
    expect(screen.getByText(/MBBS123/i)).toBeInTheDocument();
  });

  test("opens and closes edit profile modal", () => {
    render(
      <MemoryRouter>
        <DoctorDashboard />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/Edit Profile/i));
    expect(screen.getByText(/Edit Profile/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Cancel/i));
    expect(screen.queryByText(/Edit Profile/i)).not.toBeInTheDocument();
  });

  test("submits edit profile successfully", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(
      <MemoryRouter>
        <DoctorDashboard />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/Edit Profile/i));
    fireEvent.change(screen.getByPlaceholderText(/Full Name/i), {
      target: { value: "Dr. Jane Doe" },
    });
    fireEvent.click(screen.getByText(/Save/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:4000/profile/users/${mockDoctor.id}`,
        expect.objectContaining({ method: "PUT" })
      );
    });
  });

  test("opens and confirms delete modal", async () => {
    global.fetch.mockResolvedValueOnce({ ok: true });

    render(
      <MemoryRouter>
        <DoctorDashboard />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/Delete Profile/i));
    expect(screen.getByText(/Are you sure you want to delete your profile/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Yes, Delete/i));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:4000/profile/users/${mockDoctor.id}`,
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  test("searches patient and shows info", async () => {
    const mockPatient = { user_id: "p123", full_name: "Patient A", age: 30, gender: "Female" };
    const mockHistory = { medicalHistory: [{ visit_date: "2025-08-01T00:00:00Z", prescription: "Take rest" }] };

    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockPatient }) // patient fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockHistory }); // history fetch

    render(
      <MemoryRouter>
        <DoctorDashboard />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter Patient ID/i), {
      target: { value: "p123" },
    });
    fireEvent.click(screen.getByText(/Search/i));

    await waitFor(() => {
      expect(screen.getByText(/Patient A/i)).toBeInTheDocument();
      expect(screen.getByText(/Take rest/i)).toBeInTheDocument();
    });
  });

  test("opens add prescription modal and adds prescription", async () => {
    const mockPatient = { user_id: "p123", full_name: "Patient A", age: 30, gender: "Female", medicalHistory: [] };

    render(
      <MemoryRouter>
        <DoctorDashboard />
      </MemoryRouter>
    );

    // Mock patient state
    fireEvent.change(screen.getByPlaceholderText(/Enter Patient ID/i), { target: { value: "p123" } });
    fireEvent.click(screen.getByText(/Search/i));
    screen.getByText(/Add Prescription/i).click();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ medicalHistory: [{ visit_date: "2025-08-01T00:00:00Z", prescription: "Take rest" }] }),
    });

    fireEvent.change(screen.getByPlaceholderText(/Enter prescription details/i), {
      target: { value: "Take rest" },
    });
    fireEvent.click(screen.getByText(/Save/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:4000/prescription/add-prescription",
        expect.objectContaining({ method: "POST" })
      );
    });
  });
});
