import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a transcript first",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    // Mock backend upload - replace with actual API call
    setTimeout(() => {
      setIsUploading(false);
      toast({
        title: "Transcript uploaded",
        description: "Starting your meeting...",
      });
      navigate("/meeting");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-6">
      <Card className="w-full max-w-md p-8 glass-panel animate-fade-in">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">BANANADVISOR</h1>
            <p className="text-muted-foreground">Upload your transcript to begin the meeting</p>
          </div>

          <div className="space-y-4">
            <div
              className="relative border-2 border-dashed border-border/60 rounded-lg p-8 hover:border-accent transition-colors cursor-pointer bg-secondary/30 backdrop-blur-sm"
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3 text-center">
                <Upload className="h-10 w-10 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    {file ? file.name : "Click to upload PDF"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    PDF files only
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!file || isUploading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              size="lg"
            >
              {isUploading ? "Uploading..." : "Start Meeting"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Index;
