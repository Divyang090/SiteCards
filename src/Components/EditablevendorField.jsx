const EditableVendorField = ({ vendor, field, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(vendor[field]);
  
  const handleSave = () => {
    onUpdate(vendor.id, { [field]: value });
    setIsEditing(false);
  };

  return (
    <div>
      {isEditing ? (
        <input 
          value={value} 
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          autoFocus
        />
      ) : (
        <span onClick={() => setIsEditing(true)}>{vendor[field]}</span>
      )}
    </div>
  );
};