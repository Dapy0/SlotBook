import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AuthMeResponse } from "@slotbook/shared";
import Link from "next/link";

function ProfileMenu({
  me,
  profilePicture = "https://pixabay.com/vectors/blank-profile-picture-mystery-man-973460/",
  onLogout,
}: {
  me: AuthMeResponse;
  profilePicture: string;
  onLogout: () => Promise<void>;
}) {
  const logOut = () => {
    onLogout();
  };
  if (me == null) {
    return <></>;
  }
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" aria-label="Account menu" className="rounded-full">
              <Avatar>
                <AvatarImage src={profilePicture} />
                <AvatarFallback>{me.user.name[0].toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuGroup>
            <DropdownMenuItem render={<Link href={"/account/appointments"} />}>
              My bookings
            </DropdownMenuItem>
            {me.ownedFacilities.length > 0 && (
              <DropdownMenuItem render={<Link href={"/dashboard"} />}>My venues</DropdownMenuItem>
            )}
            {me.staffMembership !== null && (
              <DropdownMenuItem render={<Link href={"/work"} />}>Staff panel</DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={logOut} variant="destructive">
              Log out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default ProfileMenu;
