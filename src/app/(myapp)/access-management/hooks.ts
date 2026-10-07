import { ApplicationDTO } from "@igrp/platform-access-management-client-ts";
import { getApplications } from "./applications";
import { useEffect, useState } from "react";

export const useAccessManagement = () => {
  const [applications, setApplications] = useState<ApplicationDTO[]>([]);

  useEffect(() => {
    getApplications().then((applications) => {
      setApplications(applications);
    });
  }, []);

  //i want to return the list map applciatipns code, name to value and label
  const applicationsOptions = applications.map((application) => ({
    value: application.code,
    label: application.name,
  }));

  return { applications, applicationsOptions };
};
