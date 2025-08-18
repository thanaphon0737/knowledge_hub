"use client";
import { ReactNode } from "react";
import { Card, CardContent, Typography } from "@mui/material";

interface AnimatedFeatureProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function AnimatedFeature({ icon, title, description }: AnimatedFeatureProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-200 transition-colors duration-300">
            <div className="group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
          </div>
          <Typography variant="h6" className="font-semibold group-hover:text-blue-600 transition-colors duration-300">
            {title}
          </Typography>
        </div>
        <Typography variant="body2" color="text.secondary" className="group-hover:text-gray-700 transition-colors duration-300">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
} 