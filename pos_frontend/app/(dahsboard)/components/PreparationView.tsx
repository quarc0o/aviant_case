"use client";
import { Preparation } from "@/types/preparation";
import React, { use } from "react";

interface PreparationViewProps {
  data: Promise<Preparation[]>;
}

function PreparationView({ data }: PreparationViewProps) {
  const preparationsData = use(data);

  console.log("prep data: ", preparationsData);

  return <div>PreparationView</div>;
}

export default PreparationView;
