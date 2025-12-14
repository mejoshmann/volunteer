import { useState } from "react";
import { X } from "lucide-react";

const OpportunityForm = ({ 
  opportunity, 
  onClose, 
  onSubmit,
  updateOpportunity,
  handleOpportunityCreated 
}) => {
  const [formData, setFormData] = useState(
    opportunity || {
      date: "",
      time: "",
      end_time: "",
      title: "",
      description: "",
      location: "",
      type: "",
      max_volunteers: 1,
    }
  );
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringEndDate, setRecurringEndDate] = useState("");

  // Sanitize text input to prevent XSS
  const sanitizeText = (text) => {
    if (typeof text !== 'string') return text;
    return text.trim().replace(/[<>]/g, '').slice(0, 500);
  };

  const handleSubmit = () => {
    // Sanitize inputs
    const sanitizedData = {
      ...formData,
      title: sanitizeText(formData.title),
      description: sanitizeText(formData.description)
    };
    
    if (
      !sanitizedData.date ||
      !sanitizedData.time ||
      !sanitizedData.title ||
      !sanitizedData.description ||
      !sanitizedData.location ||
      !sanitizedData.type ||
      !sanitizedData.max_volunteers
    ) {
      alert("Please fill in all required fields");
      return;
    }

    if (isRecurring && !recurringEndDate) {
      alert("Please select an end date for recurring opportunities");
      return;
    }

    if (isRecurring && new Date(recurringEndDate) <= new Date(formData.date)) {
      alert("End date must be after the start date");
      return;
    }

    if (opportunity) {
      // Editing existing opportunity
      updateOpportunity(opportunity.id, sanitizedData);
      onClose();
    } else {
      // Creating new opportunity
      if (isRecurring) {
        // Create multiple opportunities (async, don't close form yet)
        createRecurringOpportunities(sanitizedData, recurringEndDate);
      } else {
        // Create single opportunity
        onSubmit(sanitizedData);
        onClose();
        handleOpportunityCreated();
      }
    }
  };

  const createRecurringOpportunities = async (baseData, endDate) => {
    const startDate = new Date(baseData.date);
    const end = new Date(endDate);
    const opportunities = [];
    
    let currentDate = new Date(startDate);
    
    while (currentDate <= end) {
      opportunities.push({
        ...baseData,
        date: currentDate.toISOString().split('T')[0]
      });
      
      // Move to next week (add 7 days)
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 7);
    }
    
    try {
      // Create all opportunities
      let created = 0;
      for (const oppData of opportunities) {
        await onSubmit(oppData);
        created++;
      }
      
      // Close form and reload after all created
      await handleOpportunityCreated();
      alert(`Successfully created ${created} recurring opportunities!`);
    } catch (error) {
      alert(`Failed to create all opportunities. Created some successfully, but encountered an error.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-4 w-full max-w-md my-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold">
            {opportunity ? "Edit" : "Add"} Opportunity
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Date *</label>
            <input
              type="date"
              className="w-full p-2 border rounded-md"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Time *</label>
            <input
              type="time"
              className="w-full p-2 border rounded-md"
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <input
              type="time"
              className="w-full p-2 border rounded-md"
              value={formData.end_time}
              onChange={(e) =>
                setFormData({ ...formData, end_time: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description *
            </label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows="3"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Location *
            </label>
            <select
              className="w-full p-2 border rounded-md"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            >
              <option value="">Select location</option>
              <option value="Cypress">Cypress</option>
              <option value="Grouse">Grouse</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type *</label>
            <select
              className="w-full p-2 border rounded-md"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            >
              <option value="">Select type</option>
              <option value="on-snow">On Snow</option>
              <option value="off-snow">Off Snow</option>
              <option value="other">On and Off Snow</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Max Volunteers *
            </label>
            <input
              type="number"
              min="1"
              className="w-full p-2 border rounded-md"
              value={formData.max_volunteers}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  max_volunteers: parseInt(e.target.value),
                })
              }
            />
          </div>

          {/* Recurring Opportunity Section */}
          <div className="border-t pt-3 mt-3">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="recurring" className="text-sm font-medium">
                Create recurring weekly opportunities
              </label>
            </div>
            
            {isRecurring && (
              <div className="ml-6 space-y-2">
                <p className="text-xs text-gray-600 mb-2">
                  This will create this opportunity every week starting from the selected date.
                </p>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Repeat until (End Date) *
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-md"
                    value={recurringEndDate}
                    onChange={(e) => setRecurringEndDate(e.target.value)}
                    min={formData.date}
                  />
                </div>
                {formData.date && recurringEndDate && (
                  <p className="text-xs text-blue-600">
                    Will create {Math.ceil((new Date(recurringEndDate) - new Date(formData.date)) / (7 * 24 * 60 * 60 * 1000)) + 1} opportunities
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {opportunity ? "Update" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityForm;
