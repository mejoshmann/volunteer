import { useState, useEffect, useCallback } from "react";
import { opportunityService, signupService } from "../../../lib/supabase";

export const useOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpportunities, setSelectedOpportunities] = useState([]);

  const loadOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      const opps = await opportunityService.getOpportunitiesWithSignups();
      setOpportunities(opps);
    } catch (error) {
      console.error("Error loading opportunities:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  const selectAllOpportunities = useCallback(() => {
    if (selectedOpportunities.length === opportunities.length) {
      setSelectedOpportunities([]);
    } else {
      setSelectedOpportunities(opportunities.map((o) => o.id));
    }
  }, [selectedOpportunities.length, opportunities]);

  const toggleOpportunitySelection = useCallback((id) => {
    setSelectedOpportunities((prev) =>
      prev.includes(id) ? prev.filter((oId) => oId !== id) : [...prev, id]
    );
  }, []);

  const deleteOpportunity = useCallback(
    async (id) => {
      if (!confirm("Are you sure you want to delete this opportunity?")) return;

      try {
        await opportunityService.deleteOpportunity(id);
        await loadOpportunities();
        alert("Opportunity deleted successfully!");
      } catch (error) {
        console.error("Error deleting opportunity:", error);
        alert("Failed to delete opportunity");
      }
    },
    [loadOpportunities]
  );

  const bulkDeleteOpportunities = useCallback(async () => {
    if (
      !confirm(
        `Are you sure you want to delete ${selectedOpportunities.length} opportunities?`
      )
    )
      return;

    try {
      for (const id of selectedOpportunities) {
        await opportunityService.deleteOpportunity(id);
      }
      setSelectedOpportunities([]);
      await loadOpportunities();
      alert("Opportunities deleted successfully!");
    } catch (error) {
      console.error("Error deleting opportunities:", error);
      alert("Failed to delete some opportunities");
    }
  }, [selectedOpportunities, loadOpportunities]);

  const updateOpportunity = useCallback(
    async (id, updatedData) => {
      try {
        await opportunityService.updateOpportunity(id, updatedData);
        await loadOpportunities();
      } catch (error) {
        console.error("Error updating opportunity:", error);
        throw error;
      }
    },
    [loadOpportunities]
  );

  const createOpportunity = useCallback(
    async (data) => {
      try {
        await opportunityService.createOpportunity(data);
        await loadOpportunities();
      } catch (error) {
        console.error("Error creating opportunity:", error);
        throw error;
      }
    },
    [loadOpportunities]
  );

  return {
    opportunities,
    loading,
    selectedOpportunities,
    setSelectedOpportunities,
    loadOpportunities,
    selectAllOpportunities,
    toggleOpportunitySelection,
    deleteOpportunity,
    bulkDeleteOpportunities,
    updateOpportunity,
    createOpportunity,
  };
};

export default useOpportunities;
