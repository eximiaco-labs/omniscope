"use client";

import { Heading } from "@/components/catalyst/heading";
import SectionHeader from "@/components/SectionHeader";

export default function OnConsultingPage() {
  return (
    <div className="container mx-auto py-8">
      <Heading level={1} className="mb-8">
        On Consulting
      </Heading>

      <SectionHeader 
        title="What is Consulting?" 
        subtitle="Understanding our consulting practice"
      />
      
      <div className="prose max-w-none mt-6">
        <p className="text-lg text-gray-700 mb-6">
          Consulting is a collaborative process where we work closely with clients to understand their challenges, 
          provide expert guidance, and develop strategic solutions that drive business value.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold mb-4">Our Approach</h3>
            <ul className="space-y-2">
              <li>Strategic problem analysis</li>
              <li>Expert guidance and recommendations</li>
              <li>Implementation support</li>
              <li>Knowledge transfer</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold mb-4">Key Benefits</h3>
            <ul className="space-y-2">
              <li>Access to specialized expertise</li>
              <li>Objective external perspective</li>
              <li>Accelerated problem resolution</li>
              <li>Sustainable value creation</li>
            </ul>
          </div>
        </div>

        <SectionHeader 
          title="Consulting Process" 
          subtitle="How we deliver value to our clients"
        />

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h4 className="font-semibold mb-3">Discovery</h4>
            <p className="text-sm">Understanding client needs and challenges through deep analysis and stakeholder engagement</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h4 className="font-semibold mb-3">Solution Design</h4>
            <p className="text-sm">Developing tailored strategies and recommendations based on best practices and expertise</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h4 className="font-semibold mb-3">Implementation</h4>
            <p className="text-sm">Supporting execution and ensuring sustainable value delivery through close collaboration</p>
          </div>
        </div>
      </div>
    </div>
  );
}
