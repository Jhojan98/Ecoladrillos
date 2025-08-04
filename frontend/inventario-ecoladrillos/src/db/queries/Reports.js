import { useMutation } from "@hooks/useMutation";

// POST report
export const useReportMutation = () => {
  const post = useMutation();

  return {
    post: (reportType, reportData) =>
      post.mutate(
        "POST",
        `/reportes/${reportType}/`,
        reportData,
        `Error al crear el reporte: ${reportType}`
      ),
    loading: post.loading,
    error: post.error,
  };
};
