import React from "react";
import { Avatar } from "@/components/catalyst/avatar";
import { Heading } from "@/components/catalyst/heading";

interface User {
  name?: string;
  photoUrl?: string;
  position?: string;
  email?: string;
}

interface HeaderProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <Avatar
            src={user?.photoUrl || "/profile-photo.jpg"}
            className="h-20 w-20 rounded-full ring-4 ring-blue-500 mr-6"
            alt={user?.name || "User"}
          />
          <div>
            <Heading className="text-3xl font-bold text-gray-800">
              {user?.name || "User"}
            </Heading>
            {user?.position && (
              <p className="text-lg text-gray-600 mt-1">{user.position}</p>
            )}
          </div>
        </div>
        {user?.email && <p className="text-sm text-gray-500">{user.email}</p>}
      </div>
    </header>
  );
};

export default Header;
